<?php

namespace common\services;

final class RumorScoringService
{
    public function calculate(array $input): array
    {
        $confidence = $this->clamp(
            (int)($input['source_trust_score'] ?? 0)
            + (int)($input['historical_accuracy'] ?? 0)
            + ((int)($input['independent_sources'] ?? 0) * 8)
            + (int)($input['entity_confidence'] ?? 0)
            + ((bool)($input['official_confirmation'] ?? false) ? 40 : 0)
            - ((int)($input['contradictions'] ?? 0) * 18)
            - (int)($input['age_penalty'] ?? 0)
        );

        $heat = $this->clamp(
            ((int)($input['post_count'] ?? 0) * 4)
            + min(30, (int)(($input['engagement'] ?? 0) / 100))
            + ((int)($input['source_count'] ?? 0) * 7)
            + (int)($input['velocity'] ?? 0)
            + (int)($input['freshness'] ?? 0)
        );

        return [
            'confidence_score' => $confidence,
            'heat_score' => $heat,
            'reason' => [
                'confidence_formula' => 'trust + accuracy + independent_sources + entity + official - contradictions - age',
                'heat_formula' => 'post_count + engagement + source_count + velocity + freshness',
            ],
        ];
    }

    private function clamp(int $score): int
    {
        return max(0, min(100, $score));
    }
}
