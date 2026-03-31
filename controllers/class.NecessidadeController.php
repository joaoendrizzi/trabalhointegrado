<?php

require_once "_lib/class.Banco.php";
require_once "models/class.Necessidade.php";
require_once "dao/class.NecessidadeDAO.php";
require_once "interfaceController.php";

class NecessidadeController implements Controller {
    private $necessidadeDAO;

    public function __construct() {
        $this->necessidadeDAO = new NecessidadeDAO();
    }

    public function buscarTodos() {
        if (ob_get_level()) {
            ob_clean();
        }
        header('Content-Type: application/json; charset=utf-8');
        try {
            $necessidades = $this->necessidadeDAO->buscarTodos();
            echo json_encode($necessidades, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao buscar necessidades: " . $e->getMessage());
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
            $necessidade = $this->necessidadeDAO->buscarPorId($id);
            if (empty($necessidade)) {
                http_response_code(404);
                echo json_encode(['error' => 'Necessidade não encontrada'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            echo json_encode($necessidade, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao buscar necessidade por ID: " . $e->getMessage());
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

            $necessidade = new Necessidade();
            $necessidade->setDescricao($data['descricao'] ?? '');

            $novaNecessidade = $this->necessidadeDAO->inserir($necessidade);
            http_response_code(201);
            echo json_encode($novaNecessidade, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao inserir necessidade: " . $e->getMessage());
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

            $necessidade = new Necessidade();
            $necessidade->setDescricao($data['descricao'] ?? '');

            $necessidadeAtualizada = $this->necessidadeDAO->editar($id, $necessidade);
            echo json_encode($necessidadeAtualizada, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao editar necessidade: " . $e->getMessage());
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
            $necessidade = $this->necessidadeDAO->apagar($id);
            echo json_encode(['message' => 'Necessidade apagada com sucesso', 'necessidade' => $necessidade], JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao apagar necessidade: " . $e->getMessage());
            echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
}
