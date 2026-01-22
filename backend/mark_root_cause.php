<?php
require_once 'config.php';
global $pdo;

$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['problem_id'], $data['cause_id'])) {
    try {
        $pdo->beginTransaction();

        // 1. Clear any existing root cause for this problem
        $stmtClear = $pdo->prepare("UPDATE causes SET is_root_cause = 0, action_description = NULL WHERE problem_id = ?");
        $stmtClear->execute([$data['problem_id']]);

        // 2. Set the new root cause and its action
        $stmtSet = $pdo->prepare("UPDATE causes SET is_root_cause = 1, action_description = ? WHERE cause_id = ?");
        $stmtSet->execute([$data['action'], $data['cause_id']]);

        // 3. Ensure the problem is closed
        $stmtClose = $pdo->prepare("UPDATE problems SET state = 2 WHERE problem_id = ?");
        $stmtClose->execute([$data['problem_id']]);

        $pdo->commit();
        echo json_encode(["status" => "success"]);
    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}