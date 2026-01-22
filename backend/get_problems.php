<?php
/**
 * API endpoint to retrieve all problems
 * Returns JSON array of problem records
 */
require_once 'config.php';
global $pdo;

try {
    $stmt = $pdo->query("
        SELECT 
            problem_id, 
            title, 
            team, 
            CAST(state AS UNSIGNED) as state, 
            date 
        FROM problems 
        ORDER BY date DESC
    ");
    $problems = $stmt->fetchAll();

    echo json_encode($problems);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to fetch problems", "message" => $e->getMessage()]);
}
