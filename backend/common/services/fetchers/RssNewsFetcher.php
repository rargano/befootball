<?php

declare(strict_types=1);

namespace common\services\fetchers;

use common\dto\FetchResult;

final class RssNewsFetcher implements SourceFetcherInterface
{
    public function fetch(array $source, ?string $cursor = null): FetchResult
    {
        if (empty($source['feed_url'])) {
            return new FetchResult((string) $source['id'], [], error: 'RSS feed_url is missing.');
        }

        // Inject an HTTP client and parse XML with a hardened parser in production.
        return new FetchResult((string) $source['id'], []);
    }
}
