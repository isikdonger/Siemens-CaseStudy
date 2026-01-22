<?php
require_once 'config.php';
global $pdo;

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['problem_id'], $data['state'])) {
    try {
        $stmt = $pdo->prepare("UPDATE problems SET state = ? WHERE problem_id = ?");
        $stmt->execute([$data['state'], $data['problem_id']]);

        echo json_encode(["status" => "success"]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid parameters"]);
}
