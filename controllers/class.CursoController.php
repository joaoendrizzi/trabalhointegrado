<?php

require_once "_lib/class.Banco.php";
require_once "models/class.Curso.php";
require_once "dao/class.CursoDAO.php";
require_once "interfaceController.php";

class CursoController implements Controller {
    private $cursoDAO;

    public function __construct() {
        $this->cursoDAO = new CursoDAO();
    }

    public function buscarTodos() {
        if (ob_get_level()) {
            ob_clean();
        }
        header('Content-Type: application/json; charset=utf-8');
        try {
            $cursos = $this->cursoDAO->buscarTodos();
            
            $cursosArray = [];
            foreach ($cursos as $curso) {
                $tipo = $curso->getTipo();
                $cursosArray[] = [
                    'id' => $curso->getId(),
                    'nome' => $curso->getNome(),
                    'tipo' => ($tipo !== null && $tipo !== false && $tipo !== '') ? (string)$tipo : ''
                ];
            }
            
            echo json_encode($cursosArray, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao buscar cursos: " . $e->getMessage());
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
            $curso = $this->cursoDAO->buscarPorId($id);
            if (empty($curso)) {
                http_response_code(404);
                echo json_encode(['error' => 'Curso não encontrado'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            echo json_encode($curso, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao buscar curso por ID: " . $e->getMessage());
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
            $rawInput = file_get_contents('php://input');
            error_log("Raw input recebido: " . $rawInput);
            $data = json_decode($rawInput, true);
            error_log("Data decodificada: " . print_r($data, true));
            
            if (!$data) {
                http_response_code(400);
                echo json_encode(['error' => 'Dados inválidos'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $tipo = isset($data['tipo']) ? trim($data['tipo']) : '';
            error_log("Tipo recebido (raw): " . var_export($data['tipo'] ?? 'não definido', true));
            error_log("Tipo após trim: " . var_export($tipo, true));
            error_log("Tipo length: " . strlen($tipo));
            error_log("Tipo === 'Médio'? " . ($tipo === 'Médio' ? 'sim' : 'não'));
            error_log("Tipo === 'Superior'? " . ($tipo === 'Superior' ? 'sim' : 'não'));
            
            if (empty($tipo) || ($tipo !== 'Superior' && $tipo !== 'Médio')) {
                error_log("Validação falhou - tipo inválido");
                http_response_code(400);
                echo json_encode(['error' => 'Tipo de curso inválido. Deve ser "Superior" ou "Médio". Recebido: "' . $tipo . '"'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $curso = new Curso();
            $curso->setNome($data['nome'] ?? '');
            $curso->setTipo($tipo);

            $novoCurso = $this->cursoDAO->inserir($curso);
            
            $response = [
                'id' => $novoCurso->getId(),
                'nome' => $novoCurso->getNome(),
                'tipo' => $tipo
            ];
            
            http_response_code(201);
            echo json_encode($response, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao inserir curso: " . $e->getMessage());
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

            $tipo = $data['tipo'] ?? '';
            if (empty($tipo) || ($tipo !== 'Superior' && $tipo !== 'Médio')) {
                http_response_code(400);
                echo json_encode(['error' => 'Tipo de curso inválido. Deve ser "Superior" ou "Médio"'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $curso = new Curso();
            $curso->setNome($data['nome'] ?? '');
            $curso->setTipo($tipo);

            $cursoAtualizado = $this->cursoDAO->editar($id, $curso);
            echo json_encode($cursoAtualizado, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao editar curso: " . $e->getMessage());
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
            $curso = $this->cursoDAO->apagar($id);
            echo json_encode(['message' => 'Curso apagado com sucesso', 'curso' => $curso], JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao apagar curso: " . $e->getMessage());
            echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
}
