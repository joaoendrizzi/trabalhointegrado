<?php
if (!ob_get_level()) {
    ob_start();
}

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-User-Id, X-User-Funcao");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once "controllers/interfaceController.php";

$routes = [
    'alunos' => 'AlunoController',
    'cursos' => 'CursoController',
    'necessidades' => 'NecessidadeController',
    'responsaveis' => 'ResponsavelController',
    'componentes' => 'ComponenteController',
    'pareceres' => 'ParecerController',
    'peis-gerais' => 'PeiGeralController',
    'peis-adaptativos' => 'PeiAdaptativoController',
    'comentarios-peiadaptativo' => 'ComentariosPeiAdaptativoController',
    'usuarios' => 'UsuarioController'
];

$resource = $_GET['recurso'] ?? $_GET['resource'] ?? null;
$action = $_GET['acao'] ?? $_GET['action'] ?? null;
$id = isset($_GET['id']) ? (int) $_GET['id'] : null;
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if (!$resource || !isset($routes[$resource])) {
    http_response_code(404);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Recurso não encontrado']);
    exit;
}

$controllerName = $routes[$resource];
$controllerFile = "controllers/class.$controllerName.php";

if (!file_exists($controllerFile)) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Controller não localizado']);
    exit;
}

require_once $controllerFile;

if (!class_exists($controllerName)) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Classe de controller inválida']);
    exit;
}

$controller = new $controllerName();

if ($resource === 'usuarios' && $action === 'login' && $method === 'POST') {
    require_once 'auth.php';
    exit;
}

try {
    switch ($method) {
        case 'GET':
            if ($action === 'login' && method_exists($controller, 'login')) {
                $controller->login();
                break;
            }
            if ($resource === 'comentarios-peiadaptativo' && isset($_GET['pei_adaptativo_id'])) {
                $peiAdaptativoId = (int) $_GET['pei_adaptativo_id'];
                if (method_exists($controller, 'buscarPorPeiAdaptativoId')) {
                    $controller->buscarPorPeiAdaptativoId($peiAdaptativoId);
                } else {
                    http_response_code(404);
                    header('Content-Type: application/json');
                    echo json_encode(['error' => 'Método não encontrado']);
                }
                break;
            }
            if ($resource === 'pareceres' && isset($_GET['peiadaptativo_id'])) {
                $peiAdaptativoId = (int) $_GET['peiadaptativo_id'];
                if (method_exists($controller, 'buscarPorPeiAdaptativoId')) {
                    $controller->buscarPorPeiAdaptativoId($peiAdaptativoId);
                } else {
                    http_response_code(404);
                    header('Content-Type: application/json');
                    echo json_encode(['error' => 'Método não encontrado']);
                }
                break;
            }
            if ($id) {
                $controller->buscarPorId($id);
            } else {
                $controller->buscarTodos();
            }
            break;

        case 'POST':
            $controller->inserir();
            break;

        case 'PUT':
        case 'PATCH':
            if (!$id) {
                http_response_code(400);
                header('Content-Type: application/json');
                echo json_encode(['error' => 'ID é obrigatório para atualização']);
                break;
            }
            if ($action === 'alterar-senha' && method_exists($controller, 'alterarSenha')) {
                $controller->alterarSenha($id);
            } else {
                $controller->editar($id);
            }
            break;

        case 'DELETE':
            if (!$id) {
                http_response_code(400);
                header('Content-Type: application/json');
                echo json_encode(['error' => 'ID é obrigatório para exclusão']);
                break;
            }
            $controller->apagar($id);
            break;

        default:
            http_response_code(405);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Método não suportado']);
            break;
    }
} catch (Exception $e) {
    while (ob_get_level()) {
        ob_end_clean();
    }
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    exit;
}

