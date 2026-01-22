<?php
namespace App\Repositories;
use App\Core\Database;

class ProblemRepository {
    private $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function findAll() {
        return $this->db->query("SELECT * FROM problems ORDER BY problem_id DESC")->fetchAll();
    }

    public function findById($id) {
        $stmt = $this->db->prepare("SELECT * FROM problems WHERE problem_id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function updateState($id, $state) {
        $this->db->beginTransaction();
        try {
            // Durumu güncelle
            $stmt = $this->db->prepare("UPDATE problems SET state = ? WHERE problem_id = ?");
            $stmt->execute([$state, $id]);

            // Eğer vaka yeniden açılıyorsa (1), o probleme ait kök nedenleri temizle
            if ($state == 1) {
                $stmtClear = $this->db->prepare("UPDATE causes SET is_root_cause = 0, action_description = NULL WHERE problem_id = ?");
                $stmtClear->execute([$id]);
            }

            $this->db->commit();
            return true;
        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
}