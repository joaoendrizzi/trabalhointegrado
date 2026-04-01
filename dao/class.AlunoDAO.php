<?php

require_once "_lib/class.Banco.php";
require_once "models/class.Aluno.php";

class AlunoDAO {
    private $pdo;

    function __construct() { 
        $this->pdo = Banco::getConexao(); 
    }

    function buscarTodos() {
        $sql = "SELECT a.id, a.nome, a.data_nasc AS dataNasc, a.cpf, a.endereco, a.telefone, a.email, 
                       a.matricula, a.curso_id AS cursoId, a.matricula_ativa AS matriculaAtiva,
                       a.monitoria, a.atend_psico AS atendPsico, a.maior_18 AS maior18,
                       c.nome AS cursoNome,
                       r.id AS responsavelId, r.nome AS responsavelNome, 
                       r.telefone AS responsavelTelefone, r.email AS responsavelEmail
                FROM alunos a
                LEFT JOIN cursos c ON c.id = a.curso_id
                LEFT JOIN peis_gerais pg ON pg.aluno_id = a.id
                LEFT JOIN responsaveis r ON r.id = pg.responsavel_id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();

        $alunos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $resultado = [];

        foreach ($alunos as $row) {
            $aluno = new Aluno();
            $aluno->setId($row['id']);
            $aluno->setNome($row['nome']);
            $aluno->setDataNasc($row['dataNasc']);
            $aluno->setCpf($row['cpf']);
            $aluno->setEndereco($row['endereco']);
            $aluno->setTelefone($row['telefone']);
            $aluno->setEmail($row['email']);
            $aluno->setMatricula($row['matricula']);
            $aluno->setCursoId($row['cursoId']);
            $aluno->setMatriculaAtiva($row['matriculaAtiva']);
            $aluno->setMonitoria($row['monitoria']);
            $aluno->setAtendPsico($row['atendPsico']);
            $aluno->setMaior18($row['maior18'] == 1);
            $aluno->necessidades = $this->buscarNecessidades($row['id']);
            $aluno->curso = $row['cursoNome']; 
            
            if (!empty($row['responsavelId'])) {
                $aluno->responsavel = [
                    'id' => $row['responsavelId'],
                    'nome' => $row['responsavelNome'],
                    'telefone' => $row['responsavelTelefone'],
                    'email' => $row['responsavelEmail']
                ];
            }
            
            $resultado[] = $aluno;
        }

        return $resultado;
    }

    function buscarPorNomeOuMatricula($busca) {
        $sql = "SELECT id, nome, data_nasc AS dataNasc, cpf, endereco, telefone, email, 
                       matricula, curso_id AS cursoId, matricula_ativa AS matriculaAtiva,
                       monitoria, atend_psico AS atendPsico, maior_18 AS maior18
                FROM alunos 
                WHERE nome LIKE :busca OR matricula LIKE :busca";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':busca' => "%$busca%"]);

        $stmt->setFetchMode(PDO::FETCH_CLASS, Aluno::class);
        $alunos = $stmt->fetchAll();

        foreach ($alunos as $aluno) {
            $aluno->necessidades = $this->buscarNecessidades($aluno->getId());
        }

        return $alunos ?: [];
    }

    function buscarPorId($id) {
        $sql = "SELECT a.id, a.nome, a.data_nasc AS dataNasc, a.cpf, a.endereco, a.telefone, a.email, 
                       a.matricula, a.curso_id AS cursoId, a.matricula_ativa AS matriculaAtiva,
                       a.monitoria, a.atend_psico AS atendPsico, a.maior_18 AS maior18,
                       c.nome AS cursoNome,
                       r.id AS responsavelId, r.nome AS responsavelNome, 
                       r.telefone AS responsavelTelefone, r.email AS responsavelEmail
                FROM alunos a
                LEFT JOIN cursos c ON c.id = a.curso_id
                LEFT JOIN peis_gerais pg ON pg.aluno_id = a.id
                LEFT JOIN responsaveis r ON r.id = pg.responsavel_id
                WHERE a.id = :id
                LIMIT 1";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':id' => $id]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$row) {
            return null;
        }

        $aluno = new Aluno();
        $aluno->setId($row['id']);
        $aluno->setNome($row['nome']);
        $aluno->setDataNasc($row['dataNasc']);
        $aluno->setCpf($row['cpf']);
        $aluno->setEndereco($row['endereco']);
        $aluno->setTelefone($row['telefone']);
        $aluno->setEmail($row['email']);
        $aluno->setMatricula($row['matricula']);
        $aluno->setCursoId($row['cursoId']);
        $aluno->setMatriculaAtiva($row['matriculaAtiva']);
        $aluno->setMonitoria($row['monitoria']);
        $aluno->setAtendPsico($row['atendPsico']);
        $aluno->setMaior18($row['maior18'] == 1);
        $aluno->necessidades = $this->buscarNecessidades($id);
        $aluno->curso = $row['cursoNome']; 
        
        if (!empty($row['responsavelId'])) {
            $aluno->responsavel = [
                'id' => $row['responsavelId'],
                'nome' => $row['responsavelNome'],
                'telefone' => $row['responsavelTelefone'],
                'email' => $row['responsavelEmail']
            ];
        }

        return $aluno;
    }

    function buscarNecessidades($alunoId) {
        $sql = "SELECT n.descricao 
                FROM alunos_necessidades an
                INNER JOIN necessidades n ON n.id = an.necessidade_id
                WHERE an.aluno_id = :aluno_id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':aluno_id' => $alunoId]);
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    function inserir(Aluno $aluno) {
        $sql = "INSERT INTO alunos (nome, data_nasc, cpf, endereco, telefone, email, matricula, curso_id, 
                                   matricula_ativa, monitoria, atend_psico, maior_18)
                VALUES (:nome, :data_nasc, :cpf, :endereco, :telefone, :email, :matricula, :curso_id, 
                        :matricula_ativa, :monitoria, :atend_psico, :maior_18)";
        $stmt = $this->pdo->prepare($sql);
        $resultado = $stmt->execute([
            ':nome' => $aluno->getNome(),
            ':data_nasc' => $aluno->getDataNasc(),
            ':cpf' => $aluno->getCpf(),
            ':endereco' => $aluno->getEndereco(),
            ':telefone' => $aluno->getTelefone(),
            ':email' => $aluno->getEmail(),
            ':matricula' => $aluno->getMatricula(),
            ':curso_id' => $aluno->getCursoId(),
            ':matricula_ativa' => $aluno->getMatriculaAtiva(),
            ':monitoria' => $aluno->getMonitoria(),
            ':atend_psico' => $aluno->getAtendPsico(),
            ':maior_18' => $aluno->getMaior18() ? 1 : 0
        ]);

        if ($resultado) {
            $id = $this->pdo->lastInsertId();
            return $this->buscarPorId($id);
        }
    }

    function editar($id, Aluno $aluno) {
        $a = $this->buscarPorId($id);
        if (!$a)
            throw new Exception("Aluno não encontrado!");

        $sql = "UPDATE alunos 
                SET nome=:nome, data_nasc=:data_nasc, cpf=:cpf, endereco=:endereco, 
                    telefone=:telefone, email=:email, matricula=:matricula, curso_id=:curso_id,
                    matricula_ativa=:matricula_ativa, monitoria=:monitoria, 
                    atend_psico=:atend_psico, maior_18=:maior_18
                WHERE id=:id";
        $query = $this->pdo->prepare($sql);
        $query->bindValue(':nome', $aluno->getNome());
        $query->bindValue(':data_nasc', $aluno->getDataNasc());
        $query->bindValue(':cpf', $aluno->getCpf());
        $query->bindValue(':endereco', $aluno->getEndereco());
        $query->bindValue(':telefone', $aluno->getTelefone());
        $query->bindValue(':email', $aluno->getEmail());
        $query->bindValue(':matricula', $aluno->getMatricula());
        $query->bindValue(':curso_id', $aluno->getCursoId());
        $query->bindValue(':matricula_ativa', $aluno->getMatriculaAtiva());
        $query->bindValue(':monitoria', $aluno->getMonitoria());
        $query->bindValue(':atend_psico', $aluno->getAtendPsico());
        $query->bindValue(':maior_18', $aluno->getMaior18() ? 1 : 0);
        $query->bindValue(':id', $id);

        if (!$query->execute())
            throw new Exception("Erro ao atualizar o registro.");

        return $this->buscarPorId($id);
    }

    function apagar($id) {
        $aluno = $this->buscarPorId($id);
        if (!$aluno)
            throw new Exception("Aluno não encontrado!");

        $sql = "DELETE FROM alunos WHERE id=:id";
        $query = $this->pdo->prepare($sql);
        $query->bindValue(':id', $id);

        if (!$query->execute())
            throw new Exception("Erro ao apagar registro!");

        return $aluno;
    }

    function verificarCpfExistente($cpf, $excluirId = null) {
        if (empty($cpf)) {
            return false;
        }
        $cpf = preg_replace('/\D/', '', $cpf);
        $sql = "SELECT id FROM alunos WHERE cpf = :cpf";
        $params = [':cpf' => $cpf];
        
        if ($excluirId !== null) {
            $sql .= " AND id != :excluir_id";
            $params[':excluir_id'] = $excluirId;
        }
        
        $sql .= " LIMIT 1";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result !== false;
    }

    function verificarMatriculaExistente($matricula, $excluirId = null) {
        if (empty($matricula)) {
            return false;
        }
        $sql = "SELECT id FROM alunos WHERE matricula = :matricula";
        $params = [':matricula' => $matricula];
        
        if ($excluirId !== null) {
            $sql .= " AND id != :excluir_id";
            $params[':excluir_id'] = $excluirId;
        }
        
        $sql .= " LIMIT 1";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result !== false;
    }

    function contarAlunos() {
        $sql = "SELECT COUNT(*) as total FROM alunos";
        $stmt = $this->pdo->query($sql);
        $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
        return $resultado['total'];
    }

    function buscarAlunosComPeiAdaptativo() {
        $sql = "SELECT DISTINCT a.id, a.nome, a.matricula, 
                       c.nome AS cursoNome, c.tipo AS cursoTipo, c.id AS cursoId
                FROM alunos a
                INNER JOIN peis_adaptativos pa ON pa.aluno_id = a.id
                LEFT JOIN cursos c ON c.id = COALESCE(pa.curso_id, a.curso_id)
                ORDER BY a.nome";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $resultado = [];
        
        foreach ($rows as $row) {
            $resultado[] = [
                'id' => $row['id'],
                'nome' => $row['nome'],
                'matricula' => $row['matricula'],
                'cursoNome' => $row['cursoNome'],
                'cursoTipo' => $row['cursoTipo'],
                'cursoId' => $row['cursoId']
            ];
        }
        
        return $resultado;
    }

    function buscarInformacoes($idAluno) {
        $sql = "SELECT a.nome AS nomeAluno, a.matricula AS matriculaAluno, 
                       r.nome AS nomeResponsavel, r.telefone AS telefoneResponsavel, 
                       c.nome AS nomeCurso
                FROM alunos a
                LEFT JOIN peis_gerais pg ON pg.aluno_id = a.id
                LEFT JOIN responsaveis r ON r.id = pg.responsavel_id
                LEFT JOIN cursos c ON c.id = a.curso_id
                WHERE a.id = :idAluno";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':idAluno' => $idAluno]);
        $aluno = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$aluno) {
            throw new Exception("Aluno não encontrado!");
        }

        $sqlNee = "SELECT n.descricao
                   FROM peis_gerais pg
                   INNER JOIN necessidades n ON n.id = pg.necessidade_id
                   WHERE pg.aluno_id = :idAluno";
        $stmtNee = $this->pdo->prepare($sqlNee);
        $stmtNee->execute([':idAluno' => $idAluno]);
        $necessidades = $stmtNee->fetchAll(PDO::FETCH_COLUMN);

        $aluno['necessidades'] = $necessidades ?: ["Nenhuma"];

        return $aluno;
    }

    function salvarNecessidades($alunoId, $necessidadesDescricoes) {
        if (empty($necessidadesDescricoes) || !is_array($necessidadesDescricoes)) {
            return;
        }

        $sqlDelete = "DELETE FROM alunos_necessidades WHERE aluno_id = :aluno_id";
        $stmtDelete = $this->pdo->prepare($sqlDelete);
        $stmtDelete->execute([':aluno_id' => $alunoId]);

        require_once "dao/class.NecessidadeDAO.php";
        require_once "models/class.Necessidade.php";
        $necessidadeDAO = new NecessidadeDAO();

        foreach ($necessidadesDescricoes as $descricao) {
            $descricao = trim($descricao);
            if (empty($descricao)) {
                continue;
            }

            $sqlBuscar = "SELECT id FROM necessidades WHERE descricao = :descricao LIMIT 1";
            $stmtBuscar = $this->pdo->prepare($sqlBuscar);
            $stmtBuscar->execute([':descricao' => $descricao]);
            $necessidade = $stmtBuscar->fetch(PDO::FETCH_ASSOC);

            $necessidadeId = null;
            if ($necessidade) {
                $necessidadeId = $necessidade['id'];
            } else {
                try {
                    $novaNecessidade = new Necessidade();
                    $novaNecessidade->setDescricao($descricao);
                    $necessidadeCriada = $necessidadeDAO->inserir($novaNecessidade);
                    $necessidadeId = $necessidadeCriada->getId();
                } catch (Exception $e) {
                    error_log("Erro ao criar necessidade: " . $e->getMessage());
                    continue;
                }
            }

            try {
                $sqlInsert = "INSERT INTO alunos_necessidades (aluno_id, necessidade_id) 
                             VALUES (:aluno_id, :necessidade_id)
                             ON DUPLICATE KEY UPDATE aluno_id = aluno_id";
                $stmtInsert = $this->pdo->prepare($sqlInsert);
                $stmtInsert->execute([
                    ':aluno_id' => $alunoId,
                    ':necessidade_id' => $necessidadeId
                ]);
            } catch (PDOException $e) {
                if ($e->getCode() != 23000) {
                    error_log("Erro ao salvar necessidade do aluno: " . $e->getMessage());
                }
            }
        }
    }
}