<?php

namespace console\controllers;

use common\services\RumorScoringService;

final class RumorScoreController
{
    public function actionRun(): void
    {
        $service = new RumorScoringService();
        $score = $service->calculate([
            'source_trust_score' => 32,
            'historical_accuracy' => 24,
            'independent_sources' => 2,
            'entity_confidence' => 12,
            'official_confirmation' => false,
            'contradictions' => 1,
            'age_penalty' => 6,
            'post_count' => 12,
            'engagement' => 1800,
            'source_count' => 3,
            'velocity' => 14,
            'freshness' => 10,
        ]);

        echo json_encode($score, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . PHP_EOL;
    }
}
