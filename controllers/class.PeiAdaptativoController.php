<?php

require_once "_lib/class.Banco.php";
require_once "models/class.PeiAdaptativo.php";
require_once "dao/class.PeiAdaptativoDAO.php";
require_once "interfaceController.php";

class PeiAdaptativoController implements Controller {
    private $peiAdaptativoDAO;

    public function __construct() {
        $this->peiAdaptativoDAO = new PeiAdaptativoDAO();
    }

    public function buscarTodos() {
        if (ob_get_level()) {
            ob_clean();
        }
        header('Content-Type: application/json; charset=utf-8');
        try {
            $peis = $this->peiAdaptativoDAO->buscarTodos();
            echo json_encode($peis, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao buscar PEIs: " . $e->getMessage());
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
            $pei = $this->peiAdaptativoDAO->buscarPorId($id);
            if (empty($pei)) {
                http_response_code(404);
                echo json_encode(['error' => 'PEI adaptativo não encontrado'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            echo json_encode($pei, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao buscar PEI adaptativo por ID: " . $e->getMessage());
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

            error_log("PEI Adaptativo - Dados recebidos: " . json_encode($data, JSON_UNESCAPED_UNICODE));
            error_log("PEI Adaptativo - aluno_id: " . ($data['aluno_id'] ?? 'NÃO DEFINIDO'));
            error_log("PEI Adaptativo - componente_id: " . ($data['componente_id'] ?? 'NÃO DEFINIDO'));
            error_log("PEI Adaptativo - periodo: " . ($data['periodo'] ?? 'NÃO DEFINIDO'));

            if (empty($data['aluno_id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Aluno é obrigatório'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            if (empty($data['componente_id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Componente curricular é obrigatório'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $pei = new PeiAdaptativo();
            $pei->setAlunoId($data['aluno_id']);
            $pei->setResponsavelId($data['responsavel_id'] ?? null);
            $pei->setNecessidadeId($data['necessidade_id'] ?? null);
            $pei->setComponenteId($data['componente_id']);
            $pei->setCursoId($data['curso_id'] ?? null);
            $pei->setDescricao($data['descricao'] ?? '');
            $pei->setPeriodo(isset($data['periodo']) ? trim($data['periodo']) : null);

            $novoPei = $this->peiAdaptativoDAO->inserir($pei);
            if (!$novoPei) {
                http_response_code(500);
                echo json_encode(['error' => 'Erro ao salvar PEI adaptativo'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            http_response_code(201);
            echo json_encode($novoPei, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro geral ao inserir PEI adaptativo: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
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

            error_log("PEI Adaptativo - Dados recebidos para edição: " . print_r($data, true));

            if (empty($data['aluno_id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Aluno é obrigatório'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            if (empty($data['componente_id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Componente curricular é obrigatório'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $pei = new PeiAdaptativo();
            $pei->setAlunoId($data['aluno_id']);
            $pei->setResponsavelId($data['responsavel_id'] ?? null);
            $pei->setNecessidadeId($data['necessidade_id'] ?? null);
            $pei->setComponenteId($data['componente_id']);
            $pei->setCursoId($data['curso_id'] ?? null);
            $pei->setDescricao($data['descricao'] ?? '');
            $pei->setPeriodo(isset($data['periodo']) ? trim($data['periodo']) : null);

            $peiAtualizado = $this->peiAdaptativoDAO->editar($id, $pei);
            echo json_encode($peiAtualizado, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao editar PEI adaptativo: " . $e->getMessage());
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
            $pei = $this->peiAdaptativoDAO->apagar($id);
            echo json_encode(['message' => 'PEI adaptativo apagado com sucesso', 'pei' => $pei], JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao apagar PEI adaptativo: " . $e->getMessage());
            echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
}
