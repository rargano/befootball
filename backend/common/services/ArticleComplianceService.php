<?php

namespace common\services;

final class ArticleComplianceService
{
    public function validateForPublish(array $article): array
    {
        $errors = [];

        foreach (['original_url', 'source_name', 'source_credit_text'] as $field) {
            if (empty($article[$field])) {
                $errors[] = "ข่าวต้องมี {$field}";
            }
        }

        if (!empty($article['uses_source_image']) && empty($article['image_license'])) {
            $errors[] = 'ห้ามใช้รูปจาก source โดยไม่มีสิทธิ์';
        }

        if (!empty($article['is_full_republish']) && empty($article['full_republish_allowed'])) {
            $errors[] = 'ห้ามเผยแพร่ full article ใหม่ถ้า source ไม่อนุญาต';
        }

        return [
            'ok' => count($errors) === 0,
            'errors' => $errors,
        ];
    }
}
