-- 1. Create the Database
CREATE DATABASE IF NOT EXISTS rca_tool;
USE rca_tool;

-- 2. Problems Table
-- Stores the high-level issue being investigated
CREATE TABLE problems (
                          problem_id INT AUTO_INCREMENT PRIMARY KEY,
                          title VARCHAR(255) NOT NULL,
                          team VARCHAR(100),
                          state INT DEFAULT 1, -- 1: Open, 2: Closed
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Causes Table
-- Stores the hierarchical "Whys"
CREATE TABLE causes (
                        cause_id INT AUTO_INCREMENT PRIMARY KEY,
                        problem_id INT NOT NULL,
                        parent_id INT DEFAULT NULL, -- Self-referencing FK for the tree structure
                        description TEXT NOT NULL,
                        is_root_cause TINYINT(1) DEFAULT 0,
                        action_description TEXT DEFAULT NULL,
                        FOREIGN KEY (problem_id) REFERENCES problems(problem_id) ON DELETE CASCADE,
                        FOREIGN KEY (parent_id) REFERENCES causes(cause_id) ON DELETE CASCADE
);

-- 4. Key Logic Queries used in Backend

-- Fetching the Tree (Used in get_cause_tree.php)
-- Selects all causes for a specific problem to be mapped into JSON
SELECT * FROM causes WHERE problem_id = 1;

-- Marking Root Cause (Used in mark_root_cause.php)
UPDATE causes SET is_root_cause = 1, action_description = 'Description here' WHERE cause_id = 10;
UPDATE problems SET state = 2 WHERE problem_id = 1;

-- Re-opening Investigation (Used in reopen_problem.php)
UPDATE problems SET state = 1 WHERE problem_id = 1;
UPDATE causes SET is_root_cause = 0, action_description = NULL WHERE problem_id = 1;