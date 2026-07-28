<?php

declare(strict_types=1);

namespace common\services\fetchers;

use common\dto\FetchResult;

final class SportsDataFetcher implements SourceFetcherInterface
{
    public function fetch(array $source, ?string $cursor = null): FetchResult
    {
        $keyName = (string) ($source['env_key'] ?? 'API_FOOTBALL_KEY');
        if (getenv($keyName) === false || getenv($keyName) === '') {
            return new FetchResult((string) $source['id'], [], error: "Missing {$keyName}.");
        }

        return new FetchResult((string) $source['id'], []);
    }
}
