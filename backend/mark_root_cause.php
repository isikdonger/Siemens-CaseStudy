<?php
/**
 * API endpoint to mark a cause as the root cause and close the problem
 * Updates the cause with is_root_cause flag and action description
 * Sets problem state to 2 (closed)
 */
require_once 'config.php';
global $pdo;

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['cause_id'], $data['problem_id'], $data['action'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit;
}

try {
    $pdo->beginTransaction();

    // Mark the cause as root cause and add action description
    $stmt1 = $pdo->prepare("
        UPDATE causes 
        SET is_root_cause = 1, action_description = ? 
        WHERE cause_id = ?
    ");
    $stmt1->execute([trim($data['action']), $data['cause_id']]);

    // Close the problem (state = 2)
    $stmt2 = $pdo->prepare("UPDATE problems SET state = 2 WHERE problem_id = ?");
    $stmt2->execute([$data['problem_id']]);

    $pdo->commit();
    echo json_encode([
        "status" => "success",
        "message" => "Root cause marked and problem closed"
    ]);
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode([
        "status" => "error", 
        "message" => $e->getMessage()
    ]);
}
