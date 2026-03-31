<?php

require_once "_lib/class.Banco.php";
require_once "models/class.Componente.php";
require_once "dao/class.ComponenteDAO.php";
require_once "interfaceController.php";

class ComponenteController implements Controller {
    private $componenteDAO;

    public function __construct() {
        $this->componenteDAO = new ComponenteDAO();
    }

    public function buscarTodos() {
        if (ob_get_level()) {
            ob_clean();
        }
        header('Content-Type: application/json; charset=utf-8');
        try {
            $componentes = $this->componenteDAO->buscarTodos();
            echo json_encode($componentes, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao buscar componentes: " . $e->getMessage());
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
            $componente = $this->componenteDAO->buscarPorId($id);
            if (empty($componente)) {
                http_response_code(404);
                echo json_encode(['error' => 'Componente não encontrado'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            echo json_encode($componente, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao buscar componente por ID: " . $e->getMessage());
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

            $componente = new Componente();
            $componente->setNome($data['nome'] ?? '');
            $componente->setEmenta($data['ementa'] ?? '');

            if (empty($componente->getNome())) {
                http_response_code(400);
                echo json_encode(['error' => 'Nome do componente é obrigatório'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $novoComponente = $this->componenteDAO->inserir($componente);
            http_response_code(201);
            echo json_encode($novoComponente, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao inserir componente: " . $e->getMessage());
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

            $componente = new Componente();
            $componente->setNome($data['nome'] ?? '');
            $componente->setEmenta($data['ementa'] ?? '');

            $componenteAtualizado = $this->componenteDAO->editar($id, $componente);
            echo json_encode($componenteAtualizado, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao editar componente: " . $e->getMessage());
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
            $componente = $this->componenteDAO->apagar($id);
            echo json_encode(['message' => 'Componente apagado com sucesso', 'componente' => $componente], JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao apagar componente: " . $e->getMessage());
            echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
}
