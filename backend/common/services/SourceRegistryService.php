<?php

declare(strict_types=1);

namespace common\services;

use RuntimeException;

final class SourceRegistryService
{
    /** @return array<int, array<string, mixed>> */
    public function all(): array
    {
        $path = dirname(__DIR__, 3) . '/config/sources/sources.json';
        $contents = file_get_contents($path);
        $config = $contents === false ? null : json_decode($contents, true);

        if (!is_array($config) || !isset($config['sources']) || !is_array($config['sources'])) {
            throw new RuntimeException('Source registry cannot be loaded.');
        }

        return $config['sources'];
    }

    /** @return array<int, array<string, mixed>> */
    public function enabled(): array
    {
        return array_values(array_filter($this->all(), static fn (array $source): bool => ($source['enabled'] ?? false) === true));
    }
}
