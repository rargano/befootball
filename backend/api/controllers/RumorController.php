<?php

namespace api\controllers;

use api\serializers\ApiResponse;

final class RumorController
{
    public function actionIndex(): array
    {
        return ApiResponse::success([
            [
                'slug' => 'portuguese-forward-premier-league-links',
                'title_th' => 'กองหน้าโปรตุเกสถูกเชื่อมโยงกับ 2 ทีมพรีเมียร์ลีก',
                'status' => 'heating_up',
                'confidence_score' => 48,
                'heat_score' => 82,
            ],
        ], [
            'page' => 1,
            'page_size' => 20,
            'total' => 1,
        ]);
    }
}
