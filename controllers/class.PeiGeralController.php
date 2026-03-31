<?php

require_once "_lib/class.Banco.php";
require_once "models/class.PeiGeral.php";
require_once "dao/class.PeiGeralDAO.php";
require_once "interfaceController.php";

class PeiGeralController implements Controller {
    private $peiGeralDAO;

    public function __construct() {
        $this->peiGeralDAO = new PeiGeralDAO();
    }

    public function buscarTodos() {
        if (ob_get_level()) {
            ob_clean();
        }
        header('Content-Type: application/json; charset=utf-8');
        try {
            $peis = $this->peiGeralDAO->buscarTodos();
            echo json_encode($peis, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao buscar PEIs gerais: " . $e->getMessage());
            echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    public function buscarPorId($id) {
        if (ob_get_level()) {
            ob_clean();
        }
        header('Content-Type: application/json; charset=utf-8');
        try {
            $pei = $this->peiGeralDAO->buscarPorId($id);
            if (!$pei || $pei === null) {
                http_response_code(404);
                echo json_encode(['error' => 'PEI geral não encontrado'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            echo json_encode($pei, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    public function inserir() {
        if (ob_get_level()) {
            ob_clean();
        }
        header('Content-Type: application/json; charset=utf-8');
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data) {
                http_response_code(400);
                echo json_encode(['error' => 'Dados inválidos'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            if (empty($data['alunoNome'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Nome do aluno é obrigatório'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            require_once "_lib/class.Banco.php";
            $pdo = Banco::getConexao();
            $sqlAluno = "SELECT id FROM alunos WHERE nome = :nome LIMIT 1";
            $stmtAluno = $pdo->prepare($sqlAluno);
            $stmtAluno->execute([':nome' => trim($data['alunoNome'])]);
            $alunoRow = $stmtAluno->fetch(PDO::FETCH_ASSOC);
            
            if (!$alunoRow) {
                http_response_code(404);
                echo json_encode(['error' => 'Aluno não encontrado com o nome: ' . $data['alunoNome'] . '. Verifique se o nome está correto ou cadastre o aluno primeiro.'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            
            $alunoId = $alunoRow['id'];

            $descricaoData = [
                'dificuldades' => $data['dificuldades'] ?? '',
                'habilidades' => $data['habilidades'] ?? '',
                'historico' => $data['historico'] ?? '',
                'historicoNoIFRS' => $data['historicoNoIFRS'] ?? '',
                'estrategiasDeEnsino' => $data['estrategiasDeEnsino'] ?? ''
            ];
            $descricao = json_encode($descricaoData, JSON_UNESCAPED_UNICODE);

            $pei = new PeiGeral();
            $pei->setAlunoId($alunoId);
            $pei->setResponsavelId($data['responsavel_id'] ?? null);
            $pei->setNecessidadeId($data['necessidade_id'] ?? null);
            $pei->setComponenteId($data['componente_id'] ?? null);
            $pei->setDescricao($descricao);

            $novoPei = $this->peiGeralDAO->inserir($pei);
            http_response_code(201);
            echo json_encode($novoPei, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao inserir PEI geral: " . $e->getMessage());
            echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    public function editar($id) {
        if (ob_get_level()) {
            ob_clean();
        }
        header('Content-Type: application/json; charset=utf-8');
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data) {
                http_response_code(400);
                echo json_encode(['error' => 'Dados inválidos'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $peiExistente = $this->peiGeralDAO->buscarPorId($id);
            if (!$peiExistente || $peiExistente === null) {
                http_response_code(404);
                echo json_encode(['error' => 'PEI geral não encontrado'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $alunoId = $peiExistente->getAlunoId();
            if (!empty($data['alunoNome'])) {
                require_once "_lib/class.Banco.php";
                $pdo = Banco::getConexao();
                $sqlAluno = "SELECT id FROM alunos WHERE nome = :nome LIMIT 1";
                $stmtAluno = $pdo->prepare($sqlAluno);
                $stmtAluno->execute([':nome' => $data['alunoNome']]);
                $alunoRow = $stmtAluno->fetch(PDO::FETCH_ASSOC);
                $alunoId = $alunoRow ? $alunoRow['id'] : $alunoId;
            }

            $descricaoData = [
                'dificuldades' => $data['dificuldades'] ?? '',
                'habilidades' => $data['habilidades'] ?? '',
                'historico' => $data['historico'] ?? '',
                'historicoNoIFRS' => $data['historicoNoIFRS'] ?? '',
                'estrategiasDeEnsino' => $data['estrategiasDeEnsino'] ?? ''
            ];
            $descricao = json_encode($descricaoData, JSON_UNESCAPED_UNICODE);

            $pei = new PeiGeral();
            $pei->setAlunoId($alunoId);
            $pei->setResponsavelId($peiExistente->getResponsavelId());
            $pei->setNecessidadeId($peiExistente->getNecessidadeId());
            $pei->setComponenteId($peiExistente->getComponenteId());
            $pei->setDescricao($descricao);

            $peiAtualizado = $this->peiGeralDAO->editar($id, $pei);
            echo json_encode($peiAtualizado, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao editar PEI geral: " . $e->getMessage());
            echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    public function apagar($id) {
        if (ob_get_level()) {
            ob_clean();
        }
        header('Content-Type: application/json; charset=utf-8');
        try {
            $pei = $this->peiGeralDAO->apagar($id);
            echo json_encode(['message' => 'PEI geral apagado com sucesso', 'pei' => $pei], JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
}
?>
