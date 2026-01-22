<?php
/**
 * API endpoint to retrieve the cause tree structure for a problem
 * Returns hierarchical tree model using parent_id relationships
 * 
 * Tree Structure:
 * - Root node represents the problem itself
 * - Each cause has a parent_id (NULL for root level, cause_id for children)
 * - This creates a recursive tree structure stored in the database
 */
require_once 'config.php';
global $pdo;

$problem_id = $_GET['problem_id'] ?? null;

if (!$problem_id) {
    http_response_code(400);
    echo json_encode(["error" => "problem_id parameter is required"]);
    exit;
}

try {
    // Get the problem title
    $stmtProb = $pdo->prepare("SELECT title FROM problems WHERE problem_id = ?");
    $stmtProb->execute([$problem_id]);
    $problem = $stmtProb->fetch(PDO::FETCH_ASSOC);

    if (!$problem) {
        http_response_code(404);
        echo json_encode(["error" => "Problem not found"]);
        exit;
    }

    // Get all causes for this problem
    $stmt = $pdo->prepare("SELECT * FROM causes WHERE problem_id = ? ORDER BY cause_id");
    $stmt->execute([$problem_id]);
    $causes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Initialize tree model - root node represents the problem
    $model = [];
    $model['root'] = [
        'id' => 'root',
        'data' => ['name' => $problem['title']],
        'hasChildren' => false,
        'children' => []
    ];

    // Add each cause as a node in the model
    foreach ($causes as $cause) {
        $id = (string)$cause['cause_id'];
        $model[$id] = [
            'id' => $id,
            'data' => [
                'name' => $cause['description'],
                'is_root_cause' => (int)$cause['is_root_cause'] // ADD THIS LINE
            ],
            'hasChildren' => false,
            'children' => []
        ];
    }

    // Build the hierarchy using parent_id relationships
    // If parent_id is NULL, the cause belongs to root level
    // Otherwise, it's a child of the cause with that parent_id
    foreach ($causes as $cause) {
        $id = (string)$cause['cause_id'];
        $parentId = ($cause['parent_id']) ? (string)$cause['parent_id'] : 'root';

        if (isset($model[$parentId])) {
            $model[$parentId]['children'][] = $id;
            $model[$parentId]['hasChildren'] = true;
        }
    }

    echo json_encode($model);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to fetch cause tree", "message" => $e->getMessage()]);
}
