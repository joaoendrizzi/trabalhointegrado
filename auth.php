<?php
// Iniciar output buffering para evitar qualquer output antes dos headers
if (!ob_get_level()) {
    ob_start();
}

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'Método não permitido'], JSON_UNESCAPED_UNICODE);
    exit;
}

require_once "_lib/class.Banco.php";
require_once "models/class.Usuario.php";
require_once "dao/class.UsuarioDAO.php";

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

    $usuarioDAO = new UsuarioDAO();
    $usuario = $usuarioDAO->autenticar($login, $senha);
    
    if (!$usuario) {
        http_response_code(401);
        echo json_encode(['error' => 'Login ou senha incorretos'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Converter objeto Usuario para array para JSON
    $usuarioArray = [
        'id' => $usuario->getId(),
        'siape' => $usuario->getSiape(),
        'nome' => $usuario->getNome(),
        'cpf' => $usuario->getCpf(),
        'funcao' => $usuario->getFuncao(),
        'email' => $usuario->getEmail()
    ];

    $json = json_encode($usuarioArray, JSON_UNESCAPED_UNICODE);
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

