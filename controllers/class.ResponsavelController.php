<?php

require_once "_lib/class.Banco.php";
require_once "models/class.Responsavel.php";
require_once "dao/class.ResponsavelDAO.php";
require_once "interfaceController.php";

class ResponsavelController implements Controller {
    private $responsavelDAO;

    public function __construct() {
        $this->responsavelDAO = new ResponsavelDAO();
    }

    public function buscarTodos() {
        if (ob_get_level()) {
            ob_clean();
        }
        header('Content-Type: application/json; charset=utf-8');
        try {
            $responsaveis = $this->responsavelDAO->buscarTodos();
            echo json_encode($responsaveis, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao buscar responsáveis: " . $e->getMessage());
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
            $responsavel = $this->responsavelDAO->buscarPorId($id);
            if (empty($responsavel)) {
                http_response_code(404);
                echo json_encode(['error' => 'Responsável não encontrado'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            echo json_encode($responsavel, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao buscar responsável por ID: " . $e->getMessage());
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

            $responsavel = new Responsavel();
            $responsavel->setNome($data['nome'] ?? '');
            $responsavel->setTelefone($data['telefone'] ?? '');
            $responsavel->setEmail($data['email'] ?? '');

            $novoResponsavel = $this->responsavelDAO->inserir($responsavel);
            http_response_code(201);
            echo json_encode($novoResponsavel, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao inserir responsável: " . $e->getMessage());
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

            $responsavel = new Responsavel();
            $responsavel->setNome($data['nome'] ?? '');
            $responsavel->setTelefone($data['telefone'] ?? '');
            $responsavel->setEmail($data['email'] ?? '');

            $responsavelAtualizado = $this->responsavelDAO->editar($id, $responsavel);
            echo json_encode($responsavelAtualizado, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao editar responsável: " . $e->getMessage());
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
            $responsavel = $this->responsavelDAO->apagar($id);
            echo json_encode(['message' => 'Responsável apagado com sucesso', 'responsavel' => $responsavel], JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao apagar responsável: " . $e->getMessage());
            echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
}
