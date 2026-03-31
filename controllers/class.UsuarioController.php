<?php

require_once "_lib/class.Banco.php";
require_once "models/class.Usuario.php";
require_once "dao/class.UsuarioDAO.php";
require_once "interfaceController.php";

class UsuarioController implements Controller {
    private $usuarioDAO;

    public function __construct() {
        $this->usuarioDAO = new UsuarioDAO();
    }

    public function buscarTodos() {
        if (ob_get_level()) {
            ob_clean();
        }
        header('Content-Type: application/json; charset=utf-8');
        try {
            $usuarios = $this->usuarioDAO->buscarTodos();
            echo json_encode($usuarios, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao buscar usuários: " . $e->getMessage());
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
            $usuario = $this->usuarioDAO->buscarPorId($id);
            if (empty($usuario)) {
                http_response_code(404);
                echo json_encode(['error' => 'Usuário não encontrado'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            echo json_encode($usuario, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao buscar usuário por ID: " . $e->getMessage());
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

            // Validações
            if (empty($data['nome'])) {
                http_response_code(400);
                echo json_encode(['error' => 'O nome é obrigatório'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            if (empty($data['email'])) {
                http_response_code(400);
                echo json_encode(['error' => 'O e-mail é obrigatório'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            if (empty($data['funcao'])) {
                http_response_code(400);
                echo json_encode(['error' => 'A função é obrigatória'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            if (empty($data['senha']) || strlen($data['senha']) < 8) {
                http_response_code(400);
                echo json_encode(['error' => 'A senha deve ter pelo menos 8 caracteres'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // Validação de CPF - apenas 11 dígitos
            $cpf = '';
            if (!empty($data['cpf'])) {
                $cpf = preg_replace('/\D/', '', $data['cpf']); // Remove tudo que não é dígito
                if (strlen($cpf) !== 11) {
                    http_response_code(400);
                    echo json_encode(['error' => 'CPF deve conter exatamente 11 dígitos'], JSON_UNESCAPED_UNICODE);
                    exit;
                }
            }

            // Validação de unicidade - CPF
            if (!empty($cpf) && $this->usuarioDAO->verificarCpfExistente($cpf)) {
                http_response_code(400);
                echo json_encode(['error' => 'Este CPF já está cadastrado no sistema'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $usuario = new Usuario();
            $usuario->setSiape($data['siape'] ?? null);
            $usuario->setNome($data['nome'] ?? '');
            $usuario->setCpf($cpf);
            $usuario->setFuncao($data['funcao'] ?? '');
            $usuario->setEmail($data['email'] ?? '');
            $usuario->setSenha($data['senha'] ?? '');

            try {
                $novoUsuario = $this->usuarioDAO->inserir($usuario);
            } catch (PDOException $e) {
                // Tratar erros de constraint UNIQUE do banco de dados
                if ($e->getCode() == 23000) {
                    $errorMsg = $e->getMessage();
                    if (strpos($errorMsg, 'cpf') !== false) {
                        http_response_code(400);
                        echo json_encode(['error' => 'Este CPF já está cadastrado no sistema'], JSON_UNESCAPED_UNICODE);
                        exit;
                    } elseif (strpos($errorMsg, 'email') !== false) {
                        http_response_code(400);
                        echo json_encode(['error' => 'Este e-mail já está cadastrado no sistema'], JSON_UNESCAPED_UNICODE);
                        exit;
                    }
                }
                throw $e;
            }
            http_response_code(201);
            echo json_encode($novoUsuario, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao inserir usuário: " . $e->getMessage());
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

            // Validação de CPF na edição - apenas 11 dígitos
            $cpf = '';
            if (!empty($data['cpf'])) {
                $cpf = preg_replace('/\D/', '', $data['cpf']); // Remove tudo que não é dígito
                if (strlen($cpf) !== 11) {
                    http_response_code(400);
                    echo json_encode(['error' => 'CPF deve conter exatamente 11 dígitos'], JSON_UNESCAPED_UNICODE);
                    exit;
                }
            }

            // Validação de unicidade - CPF (excluindo o próprio usuário)
            if (!empty($cpf) && $this->usuarioDAO->verificarCpfExistente($cpf, $id)) {
                http_response_code(400);
                echo json_encode(['error' => 'Este CPF já está cadastrado para outro usuário'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $usuario = new Usuario();
            $usuario->setSiape($data['siape'] ?? null);
            $usuario->setNome($data['nome'] ?? '');
            $usuario->setCpf($cpf);
            $usuario->setFuncao($data['funcao'] ?? '');
            $usuario->setEmail($data['email'] ?? '');

            try {
                $usuarioAtualizado = $this->usuarioDAO->editar($id, $usuario);
            } catch (PDOException $e) {
                // Tratar erros de constraint UNIQUE do banco de dados
                if ($e->getCode() == 23000) {
                    $errorMsg = $e->getMessage();
                    if (strpos($errorMsg, 'cpf') !== false) {
                        http_response_code(400);
                        echo json_encode(['error' => 'Este CPF já está cadastrado para outro usuário'], JSON_UNESCAPED_UNICODE);
                        exit;
                    } elseif (strpos($errorMsg, 'email') !== false) {
                        http_response_code(400);
                        echo json_encode(['error' => 'Este e-mail já está cadastrado para outro usuário'], JSON_UNESCAPED_UNICODE);
                        exit;
                    }
                }
                throw $e;
            }
            echo json_encode($usuarioAtualizado, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (PDOException $e) {
            // Tratar erros de constraint UNIQUE do banco de dados
            if ($e->getCode() == 23000) {
                $errorMsg = $e->getMessage();
                if (strpos($errorMsg, 'cpf') !== false) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Este CPF já está cadastrado para outro usuário'], JSON_UNESCAPED_UNICODE);
                    exit;
                } elseif (strpos($errorMsg, 'email') !== false) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Este e-mail já está cadastrado para outro usuário'], JSON_UNESCAPED_UNICODE);
                    exit;
                }
            }
            http_response_code(500);
            error_log("Erro PDO ao editar usuário: " . $e->getMessage());
            echo json_encode(['error' => 'Erro ao editar usuário no banco de dados'], JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao editar usuário: " . $e->getMessage());
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
            // Verificar se o usuário existe antes de tentar apagar
            $usuarioExistente = $this->usuarioDAO->buscarPorId($id);
            if (empty($usuarioExistente)) {
                http_response_code(404);
                echo json_encode(['error' => 'Usuário não encontrado'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $usuario = $this->usuarioDAO->apagar($id);
            echo json_encode(['message' => 'Usuário apagado com sucesso', 'usuario' => $usuario], JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao apagar usuário: " . $e->getMessage());
            echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    public function login() {
        // Limpar qualquer output anterior
        if (ob_get_level()) {
            ob_clean();
        }
        
        header('Content-Type: application/json; charset=utf-8');
        
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $login = isset($data['login']) ? trim($data['login']) : '';
            $senha = isset($data['senha']) ? $data['senha'] : '';

            if (!$data || $login === '' || $senha === '') {
                http_response_code(400);
                echo json_encode(['error' => 'Credenciais inválidas'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $usuario = $this->usuarioDAO->autenticar($login, $senha);
            if (!$usuario) {
                http_response_code(401);
                echo json_encode(['error' => 'Login ou senha incorretos'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $json = json_encode($usuario, JSON_UNESCAPED_UNICODE);
            if ($json === false) {
                http_response_code(500);
                echo json_encode(['error' => 'Erro ao serializar dados do usuário'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            
            echo $json;
            exit;
        } catch (PDOException $e) {
            http_response_code(500);
            error_log("Erro PDO no login: " . $e->getMessage());
            echo json_encode(['error' => 'Erro ao conectar com o banco de dados'], JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro no login: " . $e->getMessage());
            echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    public function alterarSenha($id) {
        if (ob_get_level()) {
            ob_clean();
        }
        header('Content-Type: application/json; charset=utf-8');
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data || empty($data['senha_atual']) || empty($data['nova_senha'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Dados inválidos para troca de senha'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // Validar que a nova senha tem pelo menos 8 caracteres
            if (strlen($data['nova_senha']) < 8) {
                http_response_code(400);
                echo json_encode(['error' => 'A nova senha deve ter pelo menos 8 caracteres'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // Converter ID para inteiro se for string
            $id = (int) $id;
            
            error_log("Tentando alterar senha para usuário ID: " . $id);
            error_log("Dados recebidos: " . print_r($data, true));
            
            $this->usuarioDAO->atualizarSenha($id, $data['senha_atual'], $data['nova_senha']);
            
            http_response_code(200);
            echo json_encode(['message' => 'Senha atualizada com sucesso'], JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            $errorMsg = $e->getMessage();
            error_log("Erro ao alterar senha: " . $errorMsg);
            error_log("Stack trace: " . $e->getTraceAsString());
            echo json_encode(['error' => $errorMsg], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
}

