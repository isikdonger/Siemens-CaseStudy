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
            Response::json(["error" => $e->getMessage()], 500);
        }
    }

    public function updateState() {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['problem_id'], $data['state'])) {
            Response::json(["error" => "Eksik parametre (problem_id veya state)"], 400);
        }

        try {
            $this->repo->updateState($data['problem_id'], $data['state']);
            Response::json(["status" => "success"]);
        } catch (\Exception $e) {
            Response::json(["error" => "Güncelleme hatası: " . $e->getMessage()], 500);
        }
    }
}