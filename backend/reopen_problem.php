<?php
// backend/reopen_problem.php
require_once 'config.php';
global $pdo;

$data = json_decode(file_get_contents('php://input'), true);

try {
    $pdo->beginTransaction();
    // 1. Reset Problem state to Open (1)
    $stmt1 = $pdo->prepare("UPDATE problems SET state = 1 WHERE problem_id = ?");
    $stmt1->execute([$data['problem_id']]);

    // 2. Clear root cause flags for all causes of this problem
    $stmt2 = $pdo->prepare("UPDATE causes SET is_root_cause = 0, action_description = NULL WHERE problem_id = ?");
    $stmt2->execute([$data['problem_id']]);

    $pdo->commit();
    echo json_encode(["status" => "success"]);
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}