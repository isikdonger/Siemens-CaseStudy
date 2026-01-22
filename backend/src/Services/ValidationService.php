<?php
namespace App\Services;

class ValidationService {
    private $errors = [];

    public function validate($data, $rules) {
        foreach ($rules as $field => $ruleString) {
            $value = $data[$field] ?? null;
            $ruleArray = explode('|', $ruleString);

            foreach ($ruleArray as $rule) {
                $this->applyRule($field, $value, $rule);
            }
        }
        return empty($this->errors);
    }

    private function applyRule($field, $value, $rule) {
        if ($rule === 'required' && (is_null($value) || $value === '')) {
            $this->errors[$field][] = "Bu alan zorunludur.";
        }
        if ($rule === 'int' && !filter_var($value, FILTER_VALIDATE_INT) && !is_null($value)) {
            $this->errors[$field][] = "Bu alan tam sayı olmalıdır.";
        }
        if (strpos($rule, 'min:') === 0) {
            $min = (int)substr($rule, 4);
            if (strlen($value) < $min) {
                $this->errors[$field][] = "En az $min karakter olmalıdır.";
            }
        }
    }

    public function getErrors() {
        return $this->errors;
    }
}