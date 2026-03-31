<?php

require_once "_lib/class.Banco.php";
require_once "models/class.Curso.php";

class CursoDAO{
    private $pdo;

    function __construct() { 
        $this->pdo = Banco::getConexao(); 
    }

    function buscarTodos() {
        try {
            $checkColumn = $this->pdo->query("SHOW COLUMNS FROM cursos LIKE 'tipo'");
            $tipoExiste = $checkColumn->rowCount() > 0;
            
            if ($tipoExiste) {
                $sql = "SELECT id, nome, CAST(tipo AS CHAR(50)) as tipo FROM cursos";
            } else {
                $sql = "SELECT id, nome, NULL as tipo FROM cursos";
            }
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();

            $cursos = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $curso = new Curso();
                $curso->setId($row['id']);
                $curso->setNome($row['nome']);
                
                $tipo = '';
                if (isset($row['tipo'])) {
                    $tipoRaw = $row['tipo'];
                    if ($tipoRaw !== null && $tipoRaw !== false && $tipoRaw !== '') {
                        $tipo = trim((string)$tipoRaw);
                    }
                }
                
                $curso->setTipo($tipo);
                $cursos[] = $curso;
            }

            return $cursos ?: [];
        } catch (PDOException $e) {
            error_log("Erro ao buscar cursos: " . $e->getMessage());
            throw new Exception("Erro ao buscar cursos: " . $e->getMessage());
        }
    }

    function buscarPorId($id) {
        try {
            $checkColumn = $this->pdo->query("SHOW COLUMNS FROM cursos LIKE 'tipo'");
            $tipoExiste = $checkColumn->rowCount() > 0;
            
            if ($tipoExiste) {
                $sql = "SELECT id, nome, CAST(tipo AS CHAR(50)) as tipo FROM cursos WHERE id = :id";
            } else {
                $sql = "SELECT id, nome, NULL as tipo FROM cursos WHERE id = :id";
            }
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([':id' => $id]);

            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$row) {
                return [];
            }
            
            $curso = new Curso();
            $curso->setId($row['id']);
            $curso->setNome($row['nome']);
            
            $tipo = '';
            if (isset($row['tipo'])) {
                $tipoRaw = $row['tipo'];
                if ($tipoRaw !== null && $tipoRaw !== false && $tipoRaw !== '') {
                    $tipo = trim((string)$tipoRaw);
                }
            }
            
            $curso->setTipo($tipo);
            
            return $curso;
        } catch (PDOException $e) {
            error_log("Erro ao buscar curso por ID: " . $e->getMessage());
            throw new Exception("Erro ao buscar curso: " . $e->getMessage());
        }
    }

    function inserir(Curso $curso){
        try {
            $checkColumn = $this->pdo->query("SHOW COLUMNS FROM cursos LIKE 'tipo'");
            $tipoExiste = $checkColumn->rowCount() > 0;
            
            $tipoValue = $curso->getTipo();
            
            if ($tipoExiste) {
                if (empty($tipoValue) || trim($tipoValue) === '') {
                    $tipoValue = 'Superior';
                } else {
                    $tipoValue = trim($tipoValue);
                    if ($tipoValue !== 'Superior' && $tipoValue !== 'Médio') {
                        error_log("Tipo inválido recebido: " . $tipoValue . ", usando Superior como padrão");
                        $tipoValue = 'Superior';
                    }
                }
                
                error_log("Inserindo curso - Nome: " . $curso->getNome() . ", Tipo: " . $tipoValue);
                
                $sql = "INSERT INTO cursos (nome, tipo) VALUES (:nome, :tipo)";
                $stmt = $this->pdo->prepare($sql);
                $stmt->bindValue(':nome', $curso->getNome(), PDO::PARAM_STR);
                $stmt->bindValue(':tipo', $tipoValue, PDO::PARAM_STR);
                
                try {
                    $resultado = $stmt->execute();
                    
                    if (!$resultado) {
                        $errorInfo = $stmt->errorInfo();
                        error_log("Erro ao executar INSERT: " . print_r($errorInfo, true));
                        throw new Exception("Erro ao inserir curso: " . ($errorInfo[2] ?? 'Erro desconhecido'));
                    }
                    
                    $id = $this->pdo->lastInsertId();
                    error_log("Curso inserido com ID: " . $id);
                    
                    $verificacao = $this->pdo->query("SELECT CONCAT('', tipo) as tipo FROM cursos WHERE id = " . (int)$id)->fetch(PDO::FETCH_ASSOC);
                    $tipoInserido = isset($verificacao['tipo']) ? (string)$verificacao['tipo'] : '';
                    error_log("Verificação imediata - Tipo inserido: '" . $tipoInserido . "', Tipo esperado: '" . $tipoValue . "'");
                    
                    if (empty($tipoInserido) && !empty($tipoValue)) {
                        error_log("Tipo não foi inserido, tentando UPDATE...");
                        $updateStmt = $this->pdo->prepare("UPDATE cursos SET tipo = :tipo WHERE id = :id");
                        $updateStmt->bindValue(':tipo', $tipoValue, PDO::PARAM_STR);
                        $updateStmt->bindValue(':id', $id, PDO::PARAM_INT);
                        $updateResult = $updateStmt->execute();
                        error_log("UPDATE executado: " . ($updateResult ? 'sucesso' : 'falhou'));
                    }
                    
                } catch (PDOException $e) {
                    error_log("PDOException ao inserir: " . $e->getMessage());
                    throw $e;
                }
            } else {
                $sql = "INSERT INTO cursos (nome) VALUES (:nome)";
                $stmt = $this->pdo->prepare($sql);
                $stmt->bindValue(':nome', $curso->getNome(), PDO::PARAM_STR);
                $resultado = $stmt->execute();
                
                if (!$resultado) {
                    error_log("Erro ao executar INSERT: " . print_r($stmt->errorInfo(), true));
                    throw new Exception("Erro ao inserir curso no banco de dados");
                }
            }

            if(isset($resultado) && $resultado){
                $id = $this->pdo->lastInsertId();
                
                $cursoRetornado = new Curso();
                $cursoRetornado->setId($id);
                $cursoRetornado->setNome($curso->getNome());
                
                if ($tipoExiste && !empty($tipoValue)) {
                    $cursoRetornado->setTipo($tipoValue);
                } else {
                    $cursoRetornado->setTipo('');
                }
                
                return $cursoRetornado;
            }
            
            throw new Exception("Erro ao inserir curso.");
        } catch (PDOException $e) {
            error_log("Erro PDO ao inserir curso: " . $e->getMessage());
            throw new Exception("Erro ao inserir curso: " . $e->getMessage());
        }
    }

    function editar($id, Curso $curso) {
        try {
            $c = $this->buscarPorId($id);
            if (!$c)
                throw new Exception("Curso não encontrado!");

            $checkColumn = $this->pdo->query("SHOW COLUMNS FROM cursos LIKE 'tipo'");
            $tipoExiste = $checkColumn->rowCount() > 0;

            if ($tipoExiste) {
                $sql = "UPDATE cursos SET nome=:nome, tipo=:tipo WHERE id=:id";
                $params = [
                    ':nome' => $curso->getNome(),
                    ':tipo' => $curso->getTipo() ?: 'Superior',
                    ':id' => $id
                ];
            } else {
                $sql = "UPDATE cursos SET nome=:nome WHERE id=:id";
                $params = [
                    ':nome' => $curso->getNome(),
                    ':id' => $id
                ];
            }

            $query = $this->pdo->prepare($sql);
            foreach ($params as $key => $value) {
                $query->bindValue($key, $value);
            }

            if (!$query->execute())
                throw new Exception("Erro ao atualizar o registro.");

            $c->setNome($curso->getNome());
            if ($tipoExiste) {
                $c->setTipo($curso->getTipo() ?: 'Superior');
            }
            return $c;
        } catch (PDOException $e) {
            error_log("Erro PDO ao editar curso: " . $e->getMessage());
            throw new Exception("Erro ao editar curso: " . $e->getMessage());
        }
    }

    function apagar($id) {
        $curso = $this->buscarPorId($id);
        if (!$curso)
            throw new Exception("Curso não encontrado!");

        $sql = "DELETE FROM cursos WHERE id=:id";
        $query = $this->pdo->prepare($sql);
        $query->bindValue(':id', $id);

        if (!$query->execute())
            throw new Exception("Erro ao apagar registro!");

        return $curso;
    }

}