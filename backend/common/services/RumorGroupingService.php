<?php

namespace common\services;

final class RumorGroupingService
{
    public function buildGroupKey(array $post): string
    {
        $entities = $post['entities'] ?? [];
        sort($entities);

        return hash('sha256', strtolower(implode('|', $entities) . '|' . ($post['normalized_claim'] ?? '')));
    }
}
