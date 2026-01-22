<?php
/**
 * API endpoint to create a new problem
 * Accepts: title, team, state (optional, defaults to 1)
 */
require_once 'config.php';
global $pdo;

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data || !isset($data['title']) || !isset($data['team'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Title and Team are required"]);
    exit;
}

try {
    $sql = "INSERT INTO problems (title, team, state) VALUES (:title, :team, :state)";
    $stmt = $pdo->prepare($sql);

    $result = $stmt->execute([
        ':title' => trim($data['title']),
        ':team'  => trim($data['team']),
        ':state' => $data['state'] ?? 1
    ]);

    echo json_encode([
        "status" => "success", 
        "message" => "Problem added successfully",
        "problem_id" => $pdo->lastInsertId()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
