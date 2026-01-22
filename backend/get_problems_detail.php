<?php
/**
 * API endpoint to retrieve detailed information about a specific problem
 */
require_once 'config.php';
global $pdo;

$id = $_GET['id'] ?? null;

if (!$id) {
    http_response_code(400);
    echo json_encode(["error" => "No ID provided"]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT 
            problem_id, 
            title, 
            team, 
            CAST(state AS UNSIGNED) as state, 
            date 
        FROM problems 
        WHERE problem_id = ?
    ");
    $stmt->execute([$id]);
    $problem = $stmt->fetch();

    if ($problem) {
        echo json_encode($problem);
    } else {
        http_response_code(404);
        echo json_encode(["error" => "Problem not found"]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to fetch problem", "message" => $e->getMessage()]);
}
