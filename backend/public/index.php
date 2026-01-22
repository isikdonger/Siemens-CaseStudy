<?php
/**
 * Siemens Case Study - API Entry Point (Router)
 */

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../src/Core/Autoloader.php';
\App\Core\Autoloader::register();

use App\Controllers\CauseController;
use App\Controllers\ProblemController;
use App\Utils\Response;

$requestUri = $_SERVER['REQUEST_URI'];
$scriptName = $_SERVER['SCRIPT_NAME'];

$basePath = str_replace('index.php', '', $scriptName);
$path = str_replace($basePath, '', $requestUri);
$path = explode('?', $path)[0];
$route = trim($path, '/');

try {
    switch ($route) {
        case 'problems':
            $controller = new ProblemController();
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $controller->handlePost();
            } else {
                $controller->index();
            }
            break;

        case 'tree':
            $controller = new CauseController();
            $controller->getTree();
            break;

        case 'causes':
            $controller = new CauseController();
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $controller->store();
            } else {
                Response::json(["error" => "Method not allowed"], 405);
            }
            break;

        case 'root-cause':
            $controller = new CauseController();
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $controller->markRoot();
            } else {
                Response::json(["error" => "Method not allowed"], 405);
            }
            break;

        case '':
            Response::json(["message" => "Siemens RCA API is running..."]);
            break;

        default:
            Response::json([
                "error" => "Route not found",
                "requested_path" => $route
            ], 404);
            break;
    }
} catch (\Exception $e) {
    Response::json([
        "error" => "Server Error",
        "message" => $e->getMessage()
    ], 500);
}