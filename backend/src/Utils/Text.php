<?php
namespace App\Utils;

class Text {
    public static function sanitize($text) {
        return htmlspecialchars(strip_tags(trim($text)), ENT_QUOTES, 'UTF-8');
    }
}