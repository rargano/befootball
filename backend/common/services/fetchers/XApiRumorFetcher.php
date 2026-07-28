<?php

declare(strict_types=1);

namespace common\services\fetchers;

use common\dto\FetchResult;

final class XApiRumorFetcher implements SourceFetcherInterface
{
    public function fetch(array $source, ?string $cursor = null): FetchResult
    {
        if (getenv('X_BEARER_TOKEN') === false || getenv('X_BEARER_TOKEN') === '') {
            return new FetchResult((string) $source['id'], [], error: 'Missing X_BEARER_TOKEN.');
        }

        return new FetchResult((string) $source['id'], []);
    }
}
