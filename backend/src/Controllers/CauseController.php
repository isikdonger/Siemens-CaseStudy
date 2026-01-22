<?php
namespace App\Controllers;

use App\Repositories\CauseRepository;
use App\Repositories\ProblemRepository;
use App\Utils\Response;

class CauseController {
    private $causeRepo;
    private $probRepo;

    public function __construct() {
        $this->causeRepo = new CauseRepository();
        $this->probRepo = new ProblemRepository();
    }

    public function getTree() {
        $problemId = $_GET['problem_id'] ?? null;
        if (!$problemId) Response::json(["error" => "problem_id eksik"], 400);

        $problem = $this->probRepo->findById($problemId);
        if (!$problem) Response::json(["error" => "Problem bulunamadı"], 404);

        $causes = $this->causeRepo->getAllByProblemId($problemId);

        $model = [];
        $model['root'] = [
            'id' => 'root',
            'data' => ['name' => $problem['title']],
            'children' => []
        ];

        foreach ($causes as $cause) {
            $id = (string)$cause['cause_id'];
            $model[$id] = [
                'id' => $id,
                'data' => [
                    'name' => $cause['description'],
                    'is_root_cause' => (int)$cause['is_root_cause'],
                    'action_description' => $cause['action_description']
                ],
                'children' => []
            ];
        }

        foreach ($causes as $cause) {
            $id = (string)$cause['cause_id'];
            $parentId = $cause['parent_id'] ? (string)$cause['parent_id'] : 'root';

            if (isset($model[$parentId])) {
                $model[$parentId]['children'][] = $id;
            }
        }

        $tree = [$this->buildTree($model, 'root')];

        Response::json(['model' => $model, 'tree' => $tree]);
    }

    private function buildTree($model, $nodeId) {
        $node = $model[$nodeId];
        $children = [];
        foreach ($node['children'] as $childId) {
            $children[] = $this->buildTree($model, $childId);
        }
        return [
            'id' => $node['id'],
            'data' => $node['data'],
            'children' => $children
        ];
    }

    public function store() {
        $data = json_decode(file_get_contents('php://input'), true);
        $validator = new \App\Services\ValidationService();

        $rules = [
            'problem_id' => 'required|int',
            'description' => 'required|min:3'
        ];

        if (!$validator->validate($data, $rules)) {
            \App\Utils\Response::json(
                ['validation_errors' => $validator->getErrors()],
                422,
                "Geçersiz veri girişi."
            );
        }

        try {
            $id = $this->causeRepo->add(
                $data['problem_id'],
                $data['parent_id'] === 'root' ? null : $data['parent_id'],
                \App\Utils\Text::sanitize($data['description'])
            );
            \App\Utils\Response::json(["cause_id" => $id], 201, "Başarıyla kaydedildi.");
        } catch (\Exception $e) {
            \App\Utils\Response::json(null, 500, $e->getMessage());
        }
    }

    public function markRoot() {
        $data = json_decode(file_get_contents('php://input'), true);
        try {
            $this->causeRepo->markAsRoot($data['problem_id'], $data['cause_id'], $data['action_description']);
            Response::json(["status" => "success"]);
        } catch (\Exception $e) {
            Response::json(["error" => $e->getMessage()], 500);
        }
    }
}