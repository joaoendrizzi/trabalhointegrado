<?php

require_once "_lib/class.Banco.php";
require_once "models/class.Parecer.php";
require_once "dao/class.ParecerDAO.php";
require_once "interfaceController.php";

class ParecerController implements Controller {
    private $parecerDAO;

    public function __construct() {
        $this->parecerDAO = new ParecerDAO();
    }

    public function buscarTodos() {
        if (ob_get_level()) {
            ob_clean();
        }
        header('Content-Type: application/json; charset=utf-8');
        try {
            $pareceres = $this->parecerDAO->buscarTodos();
            error_log('ParecerController::buscarTodos - Pareceres retornados: ' . count($pareceres));
            if (empty($pareceres)) {
                error_log('AVISO: Nenhum parecer encontrado no banco de dados');
            }
            echo json_encode($pareceres, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log('Erro ao buscar pareceres: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());
            echo json_encode(['error' => 'Erro ao carregar pareceres: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Error $e) {
            http_response_code(500);
            error_log('Erro fatal ao buscar pareceres: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());
            echo json_encode(['error' => 'Erro ao carregar pareceres: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    public function buscarPorId($id) {
        if (ob_get_level()) {
            ob_clean();
        }
        header('Content-Type: application/json; charset=utf-8');
        try {
            $parecer = $this->parecerDAO->buscarPorId($id);
            if (!$parecer || empty($parecer)) {
                http_response_code(404);
                echo json_encode(['error' => 'Parecer não encontrado'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            echo json_encode($parecer, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log('Erro ao buscar parecer por ID: ' . $e->getMessage());
            echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Error $e) {
            http_response_code(500);
            error_log('Erro fatal ao buscar parecer por ID: ' . $e->getMessage());
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
            $pareceres = $this->parecerDAO->buscarPorPeiAdaptativoId($peiAdaptativoId);
            echo json_encode($pareceres, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log('Erro ao buscar pareceres por PEI Adaptativo: ' . $e->getMessage());
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

            $parecer = new Parecer();
            $parecer->setPeriodo($data['periodo'] ?? '');
            $parecer->setDescricao($data['descricao'] ?? '');
            $parecer->setPeiAdaptativoId($data['peiadaptativo_id'] ?? null);
            $parecer->setCursoId($data['curso_id'] ?? null);
            $parecer->setDataEnvio($data['data_envio'] ?? null);
            
            if ($parecer->getPeiAdaptativoId()) {
                require_once "dao/class.PeiAdaptativoDAO.php";
                $peiDAO = new PeiAdaptativoDAO();
                $pei = $peiDAO->buscarPorId($parecer->getPeiAdaptativoId());
                if ($pei) {
                    if (empty($parecer->getPeriodo()) && $pei->getPeriodo()) {
                        $parecer->setPeriodo($pei->getPeriodo());
                    }
                    if (empty($parecer->getDescricao())) {
                        $descricaoPei = $pei->getDescricao();
                        if ($descricaoPei && strpos($descricaoPei, '{') === 0) {
                            $descricaoJson = json_decode($descricaoPei, true);
                            if (is_array($descricaoJson) && isset($descricaoJson['descricao'])) {
                                $parecer->setDescricao($descricaoJson['descricao']);
                            }
                        } else {
                            $parecer->setDescricao($descricaoPei ?? '');
                        }
                    }
                    if (!$parecer->getCursoId() && $pei->getCursoId()) {
                        $parecer->setCursoId($pei->getCursoId());
                    }
                }
            }

            $novoParecer = $this->parecerDAO->inserir($parecer);
            if (!$novoParecer) {
                http_response_code(500);
                echo json_encode(['error' => 'Erro ao criar parecer no banco de dados'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            http_response_code(201);
            $json = json_encode($novoParecer, JSON_UNESCAPED_UNICODE);
            if ($json === false) {
                http_response_code(500);
                error_log('Erro ao serializar parecer: ' . json_last_error_msg());
                echo json_encode(['error' => 'Erro ao serializar dados do parecer'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            echo $json;
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao inserir parecer: " . $e->getMessage());
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

            $parecer = new Parecer();
            $parecer->setPeriodo($data['periodo'] ?? '');
            $parecer->setDescricao($data['descricao'] ?? '');
            $parecer->setPeiAdaptativoId($data['peiadaptativo_id'] ?? null);
            $parecer->setDataEnvio($data['data_envio'] ?? null);

            $parecerAtualizado = $this->parecerDAO->editar($id, $parecer);
            echo json_encode($parecerAtualizado, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao editar parecer: " . $e->getMessage());
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
            $parecer = $this->parecerDAO->apagar($id);
            echo json_encode(['message' => 'Parecer apagado com sucesso', 'parecer' => $parecer], JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao apagar parecer: " . $e->getMessage());
            echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
}
