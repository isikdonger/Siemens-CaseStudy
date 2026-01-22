<?php
/**
 * API endpoint to add a new cause to the hierarchy
 * Uses parent_id relationship: NULL for root level, cause_id for child nodes
 * This implements the recursive tree structure using parent_id foreign key
 */
require_once 'config.php';
global $pdo;

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!isset($data['problem_id'], $data['description'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing required fields: problem_id and description"]);
    exit;
}

// Process parent_id: convert "root", empty string, or 0 to NULL
$parentId = $data['parent_id'] ?? null;
if ($parentId === "root" || $parentId === "" || $parentId === 0 || $parentId === "0") {
    $parentId = null;
}

try {
    $description = strip_tags($data['description']); // Removes HTML tags
    $description = trim($description); // Removes accidental whitespace
    $sql = "INSERT INTO causes (problem_id, parent_id, description) VALUES (?, ?, ?)";
    $stmt = $pdo->prepare($sql);

    $stmt->bindValue(1, (int)$data['problem_id'], PDO::PARAM_INT);
    $stmt->bindValue(2, $parentId, $parentId === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
    $stmt->bindValue(3, trim($data['description']), PDO::PARAM_STR);

    $stmt->execute();

    echo json_encode([
        "status" => "success",
        "message" => "Cause added successfully",
        "cause_id" => $pdo->lastInsertId()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
