<?php

require_once "_lib/class.Banco.php";
require_once "models/class.ComentariosPeiAdaptativo.php";
require_once "dao/class.ComentariosPeiAdaptativoDAO.php";
require_once "interfaceController.php";

class ComentariosPeiAdaptativoController implements Controller {
    private $comentarioDAO;

    public function __construct() {
        $this->comentarioDAO = new ComentariosPeiAdaptativoDAO();
    }

    public function buscarTodos() {
        if (ob_get_level()) {
            ob_clean();
        }
        header('Content-Type: application/json; charset=utf-8');
        try {
            $comentarios = $this->comentarioDAO->buscarTodos();
            echo json_encode($comentarios, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao buscar comentários: " . $e->getMessage());
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
            $comentario = $this->comentarioDAO->buscarPorId($id);
            if (empty($comentario)) {
                http_response_code(404);
                echo json_encode(['error' => 'Comentário não encontrado'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            echo json_encode($comentario, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao buscar comentário por ID: " . $e->getMessage());
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

            if (empty($data['pei_adaptativo_id']) || empty($data['comentario']) || empty($data['usuario_id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Campos obrigatórios: pei_adaptativo_id, comentario, usuario_id'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $comentario = new ComentariosPeiAdaptativo();
            $comentario->setPeiAdaptativoId($data['pei_adaptativo_id']);
            $comentario->setComentario(trim($data['comentario']));
            $comentario->setUsuarioId($data['usuario_id']);

            $novoComentario = $this->comentarioDAO->inserir($comentario);
            if (!$novoComentario) {
                http_response_code(500);
                echo json_encode(['error' => 'Erro ao salvar comentário'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            http_response_code(201);
            echo json_encode($novoComentario, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao inserir comentário: " . $e->getMessage());
            echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    public function buscarPorPeiAdaptativoId($peiAdaptativoId) {
        if (ob_get_level()) {
            ob_clean();
        }
        header('Content-Type: application/json; charset=utf-8');
        try {
            $comentarios = $this->comentarioDAO->buscarPorPeiAdaptativoId($peiAdaptativoId);
            echo json_encode($comentarios, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao buscar comentários: " . $e->getMessage());
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

            if (empty($data['comentario'])) {
                http_response_code(400);
                echo json_encode(['error' => 'O comentário não pode estar vazio'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $comentario = new ComentariosPeiAdaptativo();
            $comentario->setComentario(trim($data['comentario']));

            $comentarioAtualizado = $this->comentarioDAO->editar($id, $comentario);
            echo json_encode($comentarioAtualizado, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao editar comentário: " . $e->getMessage());
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
            $comentario = $this->comentarioDAO->apagar($id);
            echo json_encode(['message' => 'Comentário apagado com sucesso', 'comentario' => $comentario], JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao apagar comentário: " . $e->getMessage());
            echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
}
