<?php

require_once "_lib/class.Banco.php";
require_once "models/class.PeiAdaptativo.php";

class PeiAdaptativoDAO{
    private $pdo;

    function __construct() { 
        $this->pdo = Banco::getConexao(); 
    }

    function buscarTodos() {
            $sql = "SELECT 
                    pa.id, 
                    pa.aluno_id AS alunoId, 
                    pa.responsavel_id AS responsavelId,
                    pa.necessidade_id AS necessidadeId,
                    pa.componente_id AS componenteId,
                    pa.curso_id AS cursoId,
                    pa.descricao,
                    pa.periodo,
                    pa.criado_em,
                    a.nome AS alunoNome,
                    a.curso_id AS alunoCursoId,
                    COALESCE(cur_pei.nome, cur_aluno.nome) AS cursoNome,
                    IFNULL(COALESCE(cur_pei.tipo, cur_aluno.tipo), 'Superior') AS cursoTipo,
                    c.nome AS componenteNome
                FROM peis_adaptativos pa
                LEFT JOIN alunos a ON a.id = pa.aluno_id
                LEFT JOIN cursos cur_pei ON cur_pei.id = pa.curso_id
                LEFT JOIN cursos cur_aluno ON cur_aluno.id = a.curso_id
                LEFT JOIN componentes c ON c.id = pa.componente_id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();

        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $resultado = [];

        foreach ($rows as $row) {
            $pei = new PeiAdaptativo();
            $pei->setId($row['id']);
            $pei->setAlunoId($row['alunoId']);
            $pei->setResponsavelId($row['responsavelId']);
            $pei->setNecessidadeId($row['necessidadeId']);
            $pei->setComponenteId($row['componenteId']);
            $pei->setCursoId($row['cursoId'] ?? null);
            $pei->setDescricao($row['descricao']);
            $pei->setPeriodo($row['periodo'] ?? null);
            
            $pei->alunoNome = $row['alunoNome'] ?? null;
            $pei->componenteNome = $row['componenteNome'] ?? null;
            $pei->criado_em = $row['criado_em'] ?? null;
            $pei->cursoNome = $row['cursoNome'] ?? null;
            $pei->cursoTipo = $row['cursoTipo'] ?? null;
            $pei->alunoCursoId = $row['alunoCursoId'] ?? null;
            
            $pei->docente = null;
            if ($row['descricao']) {
                try {
                    $descricaoJson = json_decode($row['descricao'], true);
                    if (is_array($descricaoJson) && isset($descricaoJson['docente'])) {
                        $pei->docente = $descricaoJson['docente'];
                    }
                } catch (Exception $e) {
                }
            }
            
            $resultado[] = $pei;
        }

        return $resultado;
    }

    function buscarPorId($id) {
        $sql = "SELECT 
                    pa.id, 
                    pa.aluno_id AS alunoId, 
                    pa.responsavel_id AS responsavelId,
                    pa.necessidade_id AS necessidadeId,
                    pa.componente_id AS componenteId,
                    pa.curso_id AS cursoId,
                    pa.descricao,
                    pa.periodo,
                    pa.criado_em,
                    a.nome AS alunoNome,
                    a.curso_id AS alunoCursoId,
                    COALESCE(cur_pei.nome, cur_aluno.nome) AS cursoNome,
                    IFNULL(COALESCE(cur_pei.tipo, cur_aluno.tipo), 'Superior') AS cursoTipo,
                    c.nome AS componenteNome
                FROM peis_adaptativos pa
                LEFT JOIN alunos a ON a.id = pa.aluno_id
                LEFT JOIN cursos cur_pei ON cur_pei.id = pa.curso_id
                LEFT JOIN cursos cur_aluno ON cur_aluno.id = a.curso_id
                LEFT JOIN componentes c ON c.id = pa.componente_id
                WHERE pa.id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':id' => $id]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$row) {
            return null;
        }
        
        $pei = new PeiAdaptativo();
        $pei->setId($row['id']);
        $pei->setAlunoId($row['alunoId']);
        $pei->setResponsavelId($row['responsavelId']);
            $pei->setNecessidadeId($row['necessidadeId']);
            $pei->setComponenteId($row['componenteId']);
            $pei->setCursoId($row['cursoId'] ?? null);
            $pei->setDescricao($row['descricao']);
            $pei->setPeriodo($row['periodo'] ?? null);
            
            $pei->alunoNome = $row['alunoNome'] ?? null;
            $pei->componenteNome = $row['componenteNome'] ?? null;
            $pei->criado_em = $row['criado_em'] ?? null;
            $pei->cursoNome = $row['cursoNome'] ?? null;
            $pei->cursoTipo = $row['cursoTipo'] ?? null;
            $pei->alunoCursoId = $row['alunoCursoId'] ?? null;
            
            $pei->docente = null;
            if ($row['descricao']) {
                try {
                    $descricaoJson = json_decode($row['descricao'], true);
                    if (is_array($descricaoJson) && isset($descricaoJson['docente'])) {
                        $pei->docente = $descricaoJson['docente'];
                    }
                } catch (Exception $e) {
                }
            }

        return $pei;
    }

    function inserir(PeiAdaptativo $peiadaptativo){
        $sql = "INSERT INTO peis_adaptativos(aluno_id, responsavel_id, necessidade_id, componente_id, curso_id, descricao, periodo)
                VALUES (:aluno_id, :responsavel_id, :necessidade_id, :componente_id, :curso_id, :descricao, :periodo)";
        $stmt = $this->pdo->prepare($sql);
        
        $stmt->bindValue(':aluno_id', $peiadaptativo->getAlunoId(), PDO::PARAM_INT);
        $stmt->bindValue(':responsavel_id', $peiadaptativo->getResponsavelId(), $peiadaptativo->getResponsavelId() ? PDO::PARAM_INT : PDO::PARAM_NULL);
        $stmt->bindValue(':necessidade_id', $peiadaptativo->getNecessidadeId(), $peiadaptativo->getNecessidadeId() ? PDO::PARAM_INT : PDO::PARAM_NULL);
        $stmt->bindValue(':componente_id', $peiadaptativo->getComponenteId(), $peiadaptativo->getComponenteId() ? PDO::PARAM_INT : PDO::PARAM_NULL);
        $stmt->bindValue(':curso_id', $peiadaptativo->getCursoId(), $peiadaptativo->getCursoId() ? PDO::PARAM_INT : PDO::PARAM_NULL);
        $stmt->bindValue(':descricao', $peiadaptativo->getDescricao(), PDO::PARAM_STR);
        $stmt->bindValue(':periodo', null, PDO::PARAM_NULL); // Período não é mais usado no PEI Adaptativo
        
        try {
            $resultado = $stmt->execute();
        } catch (PDOException $e) {
            error_log("DAO inserir - PDOException: " . $e->getMessage());
            error_log("DAO inserir - Código: " . $e->getCode());
            error_log("DAO inserir - SQL executado: " . $sql);
            error_log("DAO inserir - Valores: aluno_id=" . $peiadaptativo->getAlunoId() . 
                     ", responsavel_id=" . ($peiadaptativo->getResponsavelId() ?? 'NULL') . 
                     ", necessidade_id=" . ($peiadaptativo->getNecessidadeId() ?? 'NULL') . 
                     ", componente_id=" . ($peiadaptativo->getComponenteId() ?? 'NULL') . 
                     ", periodo='" . ($peiadaptativo->getPeriodo() ?? 'NULL') . "'");
            throw new Exception("Erro ao inserir PEI adaptativo: " . $e->getMessage());
        }

        if (!$resultado) {
            $errorInfo = $stmt->errorInfo();
            error_log("DAO inserir - Erro na execução: " . print_r($errorInfo, true));
            error_log("DAO inserir - SQL executado: " . $sql);
            error_log("DAO inserir - Valores bind: aluno_id=" . $peiadaptativo->getAlunoId() . 
                     ", responsavel_id=" . ($peiadaptativo->getResponsavelId() ?? 'NULL') . 
                     ", necessidade_id=" . ($peiadaptativo->getNecessidadeId() ?? 'NULL') . 
                     ", componente_id=" . ($peiadaptativo->getComponenteId() ?? 'NULL') . 
                     ", periodo='" . ($peiadaptativo->getPeriodo() ?? 'NULL') . "'");
            
            $mensagemErro = $errorInfo[2] ?? 'Erro desconhecido';
            if (strpos($mensagemErro, 'foreign key') !== false || strpos($mensagemErro, 'FOREIGN KEY') !== false) {
                if (strpos($mensagemErro, 'aluno_id') !== false) {
                    $mensagemErro = 'Aluno não encontrado. Verifique se o aluno existe.';
                } elseif (strpos($mensagemErro, 'componente_id') !== false) {
                    $mensagemErro = 'Componente não encontrado. Verifique se o componente existe.';
                }
            }
            
            throw new Exception("Erro ao inserir PEI adaptativo: " . $mensagemErro);
        }
        
        $id = $this->pdo->lastInsertId();
        return $this->buscarPorId($id);
    }

    function editar($id, PeiAdaptativo $peiadaptativo) {
        $p = $this->buscarPorId($id);
        if (!$p)
            throw new Exception("Pei Adaptativo não encontrado!");

        $sql = "UPDATE peis_adaptativos
                SET aluno_id = :aluno_id, responsavel_id = :responsavel_id, necessidade_id = :necessidade_id, componente_id = :componente_id, curso_id = :curso_id, descricao = :descricao, periodo = :periodo
                WHERE id=:id";
        $query = $this->pdo->prepare($sql);
        $query->bindValue(':aluno_id', $peiadaptativo->getAlunoId(), PDO::PARAM_INT);
        $query->bindValue(':responsavel_id', $peiadaptativo->getResponsavelId(), $peiadaptativo->getResponsavelId() ? PDO::PARAM_INT : PDO::PARAM_NULL);
        $query->bindValue(':necessidade_id', $peiadaptativo->getNecessidadeId(), $peiadaptativo->getNecessidadeId() ? PDO::PARAM_INT : PDO::PARAM_NULL);
        $query->bindValue(':componente_id', $peiadaptativo->getComponenteId(), $peiadaptativo->getComponenteId() ? PDO::PARAM_INT : PDO::PARAM_NULL);
        $query->bindValue(':curso_id', $peiadaptativo->getCursoId(), $peiadaptativo->getCursoId() ? PDO::PARAM_INT : PDO::PARAM_NULL);
        $query->bindValue(':descricao', $peiadaptativo->getDescricao(), PDO::PARAM_STR);
        $query->bindValue(':periodo', null, PDO::PARAM_NULL); // Período não é mais usado no PEI Adaptativo
        $query->bindValue(':id', $id, PDO::PARAM_INT);

        if (!$query->execute()) {
            $errorInfo = $query->errorInfo();
            error_log("Erro ao editar PEI adaptativo: " . print_r($errorInfo, true));
            throw new Exception("Erro ao atualizar o registro: " . ($errorInfo[2] ?? 'Erro desconhecido'));
        }
        
        $warnings = $this->pdo->query("SHOW WARNINGS")->fetchAll(PDO::FETCH_ASSOC);
        if (!empty($warnings)) {
            error_log("DAO editar - WARNINGS do MySQL: " . print_r($warnings, true));
        }

        error_log("DAO editar - PEI atualizado com ID: " . $id);
        
        $verificacao = $this->pdo->query("SELECT periodo FROM peis_adaptativos WHERE id = " . $id)->fetch(PDO::FETCH_ASSOC);
        error_log("DAO editar - Período salvo no banco (raw): " . ($verificacao['periodo'] ?? 'NULL'));
        if (isset($verificacao['periodo'])) {
            error_log("DAO editar - Período salvo no banco (hex): " . bin2hex($verificacao['periodo']));
        }

        return $this->buscarPorId($id);
    }

    function apagar($id) {
        $peiadaptativo = $this->buscarPorId($id);
        if (!$peiadaptativo)
            throw new Exception("Pei adaptativo não encontrado!");

        $sql = "DELETE FROM peis_adaptativos WHERE id=:id";
        $query = $this->pdo->prepare($sql);
        $query->bindValue(':id', $id);

        if (!$query->execute())
            throw new Exception("Erro ao apagar registro!");

        return $peiadaptativo;
    }

    function contarPeis() {
        $sql = "SELECT COUNT(*) as total FROM peis_adaptativos";
        $stmt = $this->pdo->query($sql);
        $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
        return $resultado['total'];
    }
}