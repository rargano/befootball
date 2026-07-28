<?php

namespace common\services;

final class RumorComplianceService
{
    public function validateForPublish(array $rumor): array
    {
        $errors = [];

        if (empty($rumor['source_name'])) {
            $errors[] = 'ข่าวลือต้องมี source_name';
        }

        if (empty($rumor['original_url'])) {
            $errors[] = 'ข่าวลือต้องมี original_url หรือ embed URL ที่ได้รับอนุญาต';
        }

        if (empty($rumor['disclaimer'])) {
            $errors[] = 'ข่าวลือต้องมี disclaimer';
        }

        if (($rumor['platform'] ?? null) === 'x' && empty($rumor['x_api_or_embed_proof'])) {
            $errors[] = 'X content ต้องมาจาก API, embed หรือวิธีที่ได้รับอนุญาต';
        }

        if ((int)($rumor['source_count'] ?? 0) <= 1 && ($rumor['status'] ?? '') !== 'monitoring') {
            $errors[] = 'ข่าวลือจากแหล่งเดียวต้องเริ่มจาก monitoring';
        }

        return [
            'ok' => count($errors) === 0,
            'errors' => $errors,
        ];
    }
}
