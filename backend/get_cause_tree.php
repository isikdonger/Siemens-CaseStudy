<?php
/**
 * API endpoint to retrieve the cause tree structure for a problem
 * Returns:
 *  - model: flat adjacency map (for logic & sidebar)
 *  - tree: nested structure (for visual rendering)
 */

require_once 'config.php';
global $pdo;

header('Content-Type: application/json');

$problem_id = $_GET['problem_id'] ?? null;

if (!$problem_id) {
    http_response_code(400);
    echo json_encode(["error" => "problem_id parameter is required"]);
    exit;
}

try {
    // 1. Get problem
    $stmtProb = $pdo->prepare("SELECT title FROM problems WHERE problem_id = ?");
    $stmtProb->execute([$problem_id]);
    $problem = $stmtProb->fetch(PDO::FETCH_ASSOC);

    if (!$problem) {
        http_response_code(404);
        echo json_encode(["error" => "Problem not found"]);
        exit;
    }

    // 2. Get causes
    $stmt = $pdo->prepare("
        SELECT cause_id, description, parent_id, is_root_cause
        FROM causes
        WHERE problem_id = ?
        ORDER BY cause_id
    ");
    $stmt->execute([$problem_id]);
    $causes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 3. Initialize model
    $model = [];

    $model['root'] = [
        'id' => 'root',
        'data' => [
            'name' => $problem['title']
        ],
        'children' => [],
        'hasChildren' => false
    ];

    foreach ($causes as $cause) {
        $id = (string)$cause['cause_id'];
        $model[$id] = [
            'id' => $id,
            'data' => [
                'name' => $cause['description'],
                'is_root_cause' => (int)$cause['is_root_cause']
            ],
            'children' => [],
            'hasChildren' => false
        ];
    }

    // 4. Link parents
    foreach ($causes as $cause) {
        $id = (string)$cause['cause_id'];
        $parentId = $cause['parent_id']
            ? (string)$cause['parent_id']
            : 'root';

        if (isset($model[$parentId])) {
            $model[$parentId]['children'][] = $id;
            $model[$parentId]['hasChildren'] = true;
        }
    }

    // 5. Recursive tree builder
    function buildTree($model, $nodeId) {
        $node = $model[$nodeId];
        $children = [];

        foreach ($node['children'] as $childId) {
            $children[] = buildTree($model, $childId);
        }

        return [
            'id' => $node['id'],
            'data' => $node['data'],
            'children' => $children
        ];
    }

    $tree = [
        buildTree($model, 'root')
    ];

    // 6. Final response
    echo json_encode([
        'model' => $model,
        'tree' => $tree
    ]);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "error" => "Failed to fetch cause tree",
        "message" => $e->getMessage()
    ]);
}
