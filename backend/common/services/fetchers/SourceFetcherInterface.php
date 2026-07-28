<?php

declare(strict_types=1);

namespace common\services\fetchers;

use common\dto\FetchResult;

interface SourceFetcherInterface
{
    /** @param array<string, mixed> $source */
    public function fetch(array $source, ?string $cursor = null): FetchResult;
}
