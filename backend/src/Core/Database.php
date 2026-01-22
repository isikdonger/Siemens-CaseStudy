<?php
namespace App\Core;
use PDO;
use Exception;

class Database {
    private static $instance = null;

    public static function getConnection() {
        if (self::$instance === null) {
            $configPath = dirname(dirname(__DIR__)) . '/config.php';

            if (!file_exists($configPath)) {
                throw new Exception("config.php dosyası bulunamadı! Aranan yol: " . $configPath);
            }

            $config = require $configPath;

            try {
                $dsn = "mysql:host={$config['host']};dbname={$config['db']};charset={$config['charset']}";
                self::$instance = new PDO($dsn, $config['user'], $config['pass'], [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
                ]);
            } catch (Exception $e) {
                throw new Exception("DB Baglantı Hatası: " . $e->getMessage());
            }
        }
        return self::$instance;
    }
}