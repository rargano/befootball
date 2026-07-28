<?php

declare(strict_types=1);

namespace common\dto;

final class FetchResult
{
    /** @param array<int, array<string, mixed>> $items */
    public function __construct(
        public readonly string $sourceId,
        public readonly array $items,
        public readonly ?string $nextCursor = null,
        public readonly ?string $error = null,
    ) {
    }

    public function isSuccessful(): bool
    {
        return $this->error === null;
    }
}
