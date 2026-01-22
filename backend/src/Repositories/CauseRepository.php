<?php
namespace App\Repositories;
use App\Core\Database;

class CauseRepository {
    private $db;
    public function __construct() { $this->db = Database::getConnection(); }

    public function add($problemId, $parentId, $description) {
        $sql = "INSERT INTO causes (problem_id, parent_id, description) VALUES (?, ?, ?)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$problemId, $parentId, $description]);
        return $this->db->lastInsertId();
    }

    public function getAllByProblemId($problemId) {
        $stmt = $this->db->prepare("SELECT * FROM causes WHERE problem_id = ? ORDER BY cause_id");
        $stmt->execute([$problemId]);
        return $stmt->fetchAll();
    }

    public function markAsRoot($problemId, $causeId, $action) {
        $this->db->beginTransaction();
        try {
            $stmtClear = $this->db->prepare("UPDATE causes SET is_root_cause = 0, action_description = NULL WHERE problem_id = ?");
            $stmtClear->execute([$problemId]);

            $stmtMark = $this->db->prepare("UPDATE causes SET is_root_cause = 1, action_description = ? WHERE cause_id = ?");
            $stmtMark->execute([$action, $causeId]);

            $stmtClose = $this->db->prepare("UPDATE problems SET state = 2 WHERE problem_id = ?");
            $stmtClose->execute([$problemId]);

            $this->db->commit();
            return true;
        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
}