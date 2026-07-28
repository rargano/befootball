<?php

declare(strict_types=1);

namespace common\services\fetchers;

use common\dto\FetchResult;

final class ManualInputFetcher implements SourceFetcherInterface
{
    public function fetch(array $source, ?string $cursor = null): FetchResult
    {
        // Manual records come from the CMS database, never from an external request.
        return new FetchResult((string) $source['id'], []);
    }
}
