<?php
namespace App\Controllers;

use App\Repositories\ProblemRepository;
use App\Utils\Response;

class ProblemController {
    private $repo;

    public function __construct() {
        $this->repo = new ProblemRepository();
    }

    public function index() {
        try {
            $problems = $this->repo->findAll();
            Response::json($problems);
        } catch (\Exception $e) {
            Response::json(null, 500, $e->getMessage());
        }
    }

    public function handlePost() {
        $data = json_decode(file_get_contents('php://input'), true);

        if (isset($data['problem_id']) && !empty($data['problem_id'])) {
            $this->updateState($data);
        } else {
            $this->store($data);
        }
    }

    private function store($data) {
        try {
            $id = $this->repo->add($data['title'], $data['team'] ?? '');
            Response::json(["problem_id" => $id, "status" => "success"], 201);
        } catch (\Exception $e) {
            Response::json(null, 500, $e->getMessage());
        }
    }

    private function updateState($data) {
        if (!isset($data['state'])) {
            Response::json(null, 400, "Durum (state) bilgisi eksik.");
        }

        try {
            $this->repo->updateState($data['problem_id'], $data['state']);
            Response::json(["problem_id" => $data['problem_id']], 200, "Durum güncellendi.");
        } catch (\Exception $e) {
            Response::json(null, 500, $e->getMessage());
        }
    }
}