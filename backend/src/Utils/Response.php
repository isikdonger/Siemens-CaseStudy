<?php
namespace App\Utils;

class Response {
    public static function json($data, $status = 200, $message = null) {
        http_response_code($status);
        header('Content-Type: application/json; charset=UTF-8');

        $response = [
            'status' => ($status >= 200 && $status < 300) ? 'success' : 'error',
            'data'   => $data,
            'timestamp' => date('Y-m-d H:i:s')
        ];

        if ($message) {
            $response['message'] = $message;
        }

        echo json_encode($response);
        exit;
    }
}