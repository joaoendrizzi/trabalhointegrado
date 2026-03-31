<?php

require_once "_lib/class.Banco.php";
require_once "models/class.Parecer.php";

class ParecerDAO{
    private $pdo;

    function __construct() { 
        $this->pdo = Banco::getConexao(); 
    }

    function buscarTodos() {
        try {
            $checkSql = "SELECT COUNT(*) as total FROM pareceres";
            $checkStmt = $this->pdo->query($checkSql);
            $checkResult = $checkStmt->fetch(PDO::FETCH_ASSOC);
            $totalPareceres = (int)($checkResult['total'] ?? 0);
            
            if ($totalPareceres === 0) {
                error_log('ParecerDAO::buscarTodos - Nenhum parecer encontrado na tabela');
                return [];
            }
            
            $sql = "SELECT 
                        p.id, 
                        p.periodo, 
                        p.descricao, 
                        p.peiadaptativo_id AS peiAdaptativoId, 
                        p.data_envio AS dataEnvio,
                        a.nome AS alunoNome,
                        a.curso_id AS alunoCursoId,
                        cur.nome AS cursoNome,
                        IFNULL(cur.tipo, 'Superior') AS cursoTipo,
                        pa.periodo AS peiPeriodo,
                        pa.descricao AS peiDescricao,
                        pa.criado_em AS peiCriadoEm,
                        c.nome AS componenteNome
                    FROM pareceres p
                    LEFT JOIN peis_adaptativos pa ON pa.id = p.peiadaptativo_id
                    LEFT JOIN alunos a ON a.id = pa.aluno_id
                    LEFT JOIN cursos cur ON cur.id = a.curso_id
                    LEFT JOIN componentes c ON c.id = pa.componente_id
                    WHERE p.id IS NOT NULL
                    ORDER BY p.id DESC";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();

            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            error_log('ParecerDAO::buscarTodos - Linhas encontradas: ' . count($rows));
            $resultado = [];

            foreach ($rows as $row) {
                if (empty($row['id']) || !isset($row['id'])) {
                    error_log('ParecerDAO::buscarTodos - Pulando linha sem ID válido');
                    continue;
                }
                
                $temDescricao = !empty($row['descricao']);
                $temPeriodo = !empty($row['periodo']) || !empty($row['peiPeriodo']);
                
                if (!$temDescricao && !$temPeriodo) {
                    error_log('ParecerDAO::buscarTodos - Pulando parecer ID ' . $row['id'] . ' sem descrição ou período');
                    continue;
                }
                
                if (!empty($row['peiAdaptativoId']) && empty($row['peiCriadoEm'])) {
                    if (!$temDescricao && !$temPeriodo) {
                        error_log('ParecerDAO::buscarTodos - Pulando parecer ID ' . $row['id'] . ' com PEI excluído e sem dados próprios');
                        continue;
                    }
                }
                
                error_log('Processando parecer ID: ' . ($row['id'] ?? 'N/A'));
                $parecer = new Parecer();
                $parecer->setId($row['id']);
                $parecer->setPeriodo($row['periodo'] ?: $row['peiPeriodo']);
                $parecer->setDescricao($row['descricao']);
                $parecer->setPeiAdaptativoId($row['peiAdaptativoId']);
                $parecer->setDataEnvio($row['dataEnvio']);
                
                $parecer->alunoNome = $row['alunoNome'] ?? null;
                $parecer->peiPeriodo = $row['peiPeriodo'] ?? null;
                $parecer->peiDescricao = $row['peiDescricao'] ?? null;
                $parecer->peiCriadoEm = $row['peiCriadoEm'] ?? null;
                $parecer->componenteNome = $row['componenteNome'] ?? null;
                $parecer->cursoNome = $row['cursoNome'] ?? null;
                $parecer->cursoTipo = $row['cursoTipo'] ?? null;
                $parecer->alunoCursoId = $row['alunoCursoId'] ?? null;
                
                $parecer->docente = null;
                if ($row['peiDescricao']) {
                    try {
                        $descricaoJson = json_decode($row['peiDescricao'], true);
                        if (is_array($descricaoJson) && isset($descricaoJson['docente'])) {
                            $parecer->docente = $descricaoJson['docente'];
                        }
                    } catch (Exception $e) {
                    }
                }
                
                $resultado[] = $parecer;
            }

            error_log('ParecerDAO::buscarTodos - Total de pareceres retornados: ' . count($resultado));
            return $resultado;
        } catch (PDOException $e) {
            error_log('Erro SQL em buscarTodos pareceres: ' . $e->getMessage());
            throw new Exception('Erro ao buscar pareceres: ' . $e->getMessage());
        }
    }

    function buscarPorId($id) {
        try {
            $sql = "SELECT 
                        p.id, 
                        p.periodo, 
                        p.descricao, 
                        p.peiadaptativo_id AS peiAdaptativoId, 
                        p.data_envio AS dataEnvio,
                        p.curso_id,
                        a.nome AS alunoNome,
                        pa.periodo AS peiPeriodo,
                        pa.descricao AS peiDescricao,
                        pa.criado_em AS peiCriadoEm,
                        c.nome AS componenteNome
                    FROM pareceres p
                    LEFT JOIN peis_adaptativos pa ON pa.id = p.peiadaptativo_id
                    LEFT JOIN alunos a ON a.id = pa.aluno_id
                    LEFT JOIN componentes c ON c.id = pa.componente_id
                    WHERE p.id = :id";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([':id' => $id]);

            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$row) {
                return null;
            }
            
            $parecer = new Parecer();
            $parecer->setId($row['id']);
            $parecer->setPeriodo($row['periodo']);
            $parecer->setDescricao($row['descricao']);
            $parecer->setPeiAdaptativoId($row['peiAdaptativoId']);
            $parecer->setDataEnvio($row['dataEnvio']);
            $parecer->setCursoId($row['curso_id'] ?? null);
            
            $parecer->alunoNome = $row['alunoNome'] ?? null;
            $parecer->peiPeriodo = $row['peiPeriodo'] ?? null;
            $parecer->peiDescricao = $row['peiDescricao'] ?? null;
            $parecer->peiCriadoEm = $row['peiCriadoEm'] ?? null;
            $parecer->componenteNome = $row['componenteNome'] ?? null;
            
            $parecer->docente = null;
            if ($row['peiDescricao']) {
                try {
                    $descricaoJson = json_decode($row['peiDescricao'], true);
                    if (is_array($descricaoJson) && isset($descricaoJson['docente'])) {
                        $parecer->docente = $descricaoJson['docente'];
                    }
                } catch (Exception $e) {
                }
            }
            
            return $parecer;
        } catch (PDOException $e) {
            error_log('Erro SQL em buscarPorId pareceres: ' . $e->getMessage());
            throw new Exception('Erro ao buscar parecer: ' . $e->getMessage());
        }
    }

    function inserir(Parecer $parecer){
        $sql = "INSERT INTO pareceres (periodo, descricao, peiadaptativo_id, curso_id, data_envio)
                VALUES (:periodo, :descricao, :peiadaptativo_id, :curso_id, :data_envio)";
        $stmt = $this->pdo->prepare($sql);
        $resultado = $stmt->execute([
            ':periodo' => $parecer->getPeriodo(),
            ':descricao' => $parecer->getDescricao(),
            ':peiadaptativo_id' => $parecer->getPeiAdaptativoId(),
            ':curso_id' => $parecer->getCursoId(),
            ':data_envio' => $parecer->getDataEnvio(),
        ]);

        if($resultado){
            $id = $this->pdo->lastInsertId();
            return $this->buscarPorId($id);
        }
    }

    function editar($id, Parecer $parecer) {
        $p = $this->buscarPorId($id);
        if (!$p)
            throw new Exception("Parecer não encontrado!");

        $sql = "UPDATE pareceres 
                SET periodo=:periodo, descricao=:descricao, peiadaptativo_id = :peiadaptativo_id, data_envio = :data_envio
                WHERE id=:id";
        $query = $this->pdo->prepare($sql);
        $query->bindValue(':periodo', $parecer->getPeriodo());
        $query->bindValue(':descricao', $parecer->getDescricao());
        $query->bindValue(':peiadaptativo_id', $parecer->getPeiAdaptativoId());
        $query->bindValue(':data_envio', $parecer->getDataEnvio());
        $query->bindValue(':id', $id);

        if (!$query->execute())
            throw new Exception("Erro ao atualizar o registro.");

        $p->setPeriodo($parecer->getPeriodo());
        $p->setDescricao($parecer->getDescricao());
        $p->setPeiAdaptativoId($parecer->getPeiAdaptativoId());
        $p->setDataEnvio($parecer->getDataEnvio());
        return $p;
    }

    function buscarPorPeiAdaptativoId($peiAdaptativoId) {
        try {
            $sql = "SELECT 
                        p.id, 
                        p.periodo, 
                        p.descricao, 
                        p.peiadaptativo_id AS peiAdaptativoId, 
                        p.data_envio AS dataEnvio,
                        p.curso_id,
                        a.nome AS alunoNome,
                        pa.periodo AS peiPeriodo,
                        pa.descricao AS peiDescricao,
                        pa.criado_em AS peiCriadoEm,
                        c.nome AS componenteNome
                    FROM pareceres p
                    LEFT JOIN peis_adaptativos pa ON pa.id = p.peiadaptativo_id
                    LEFT JOIN alunos a ON a.id = pa.aluno_id
                    LEFT JOIN componentes c ON c.id = pa.componente_id
                    WHERE p.peiadaptativo_id = :peiadaptativo_id
                    ORDER BY p.id DESC";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([':peiadaptativo_id' => $peiAdaptativoId]);

            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $resultado = [];

            foreach ($rows as $row) {
                $parecer = new Parecer();
                $parecer->setId($row['id']);
                $parecer->setPeriodo($row['periodo']);
                $parecer->setDescricao($row['descricao']);
                $parecer->setPeiAdaptativoId($row['peiAdaptativoId']);
                $parecer->setDataEnvio($row['dataEnvio']);
                $parecer->setCursoId($row['curso_id'] ?? null);
                
                $parecer->alunoNome = $row['alunoNome'] ?? null;
                $parecer->peiPeriodo = $row['peiPeriodo'] ?? null;
                $parecer->peiDescricao = $row['peiDescricao'] ?? null;
                $parecer->peiCriadoEm = $row['peiCriadoEm'] ?? null;
                $parecer->componenteNome = $row['componenteNome'] ?? null;
                
                $parecer->docente = null;
                if ($row['peiDescricao']) {
                    try {
                        $descricaoJson = json_decode($row['peiDescricao'], true);
                        if (is_array($descricaoJson) && isset($descricaoJson['docente'])) {
                            $parecer->docente = $descricaoJson['docente'];
                        }
                    } catch (Exception $e) {
                    }
                }
                
                $resultado[] = $parecer;
            }

            return $resultado;
        } catch (PDOException $e) {
            error_log('Erro SQL em buscarPorPeiAdaptativoId: ' . $e->getMessage());
            throw new Exception('Erro ao buscar pareceres: ' . $e->getMessage());
        }
    }

    function apagar($id) {
        $parecer = $this->buscarPorId($id);
        if (!$parecer)
            throw new Exception("Parecer não encontrado!");

        $sql = "DELETE FROM pareceres WHERE id=:id";
        $query = $this->pdo->prepare($sql);
        $query->bindValue(':id', $id);

        if (!$query->execute())
            throw new Exception("Erro ao apagar registro!");

        return $parecer;
    }
}