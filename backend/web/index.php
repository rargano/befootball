<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);

function api_success(array $data, ?array $pagination = null): void
{
    echo json_encode([
        'status' => 'success',
        'data' => $data,
        'pagination' => $pagination,
        'error_msg' => null,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}

function api_fail(string $message, int $status = 500): void
{
    http_response_code($status);
    echo json_encode([
        'status' => 'fail',
        'data' => null,
        'pagination' => null,
        'error_msg' => $message,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}

function project_root(): string
{
    return dirname(__DIR__, 2);
}

function read_mock_data(string $name): array
{
    $path = project_root() . "/public/api/{$name}.json";
    $contents = is_readable($path) ? file_get_contents($path) : false;
    $json = $contents === false ? null : json_decode($contents, true);

    return is_array($json) && isset($json['data']) && is_array($json['data']) ? $json['data'] : [];
}

function load_sources(): array
{
    $path = project_root() . '/config/sources/sources.json';
    $contents = is_readable($path) ? file_get_contents($path) : false;
    $json = $contents === false ? null : json_decode($contents, true);

    if (!is_array($json) || !isset($json['sources']) || !is_array($json['sources'])) {
        return [];
    }

    return array_values(array_filter($json['sources'], static function (array $source): bool {
        return ($source['enabled'] ?? false) === true
            && ($source['allow_fetch'] ?? false) === true
            && ($source['allow_display'] ?? false) === true;
    }));
}

function fetch_url(string $url): ?string
{
    $context = stream_context_create([
        'http' => [
            'timeout' => 6,
            'ignore_errors' => true,
            'header' => "User-Agent: beFootball/1.0 RSS Reader\r\n",
        ],
        'ssl' => [
            'verify_peer' => true,
            'verify_peer_name' => true,
        ],
    ]);

    $body = @file_get_contents($url, false, $context);

    return $body === false ? null : $body;
}

function clean_text(?string $value): string
{
    $text = trim(html_entity_decode(strip_tags((string) $value), ENT_QUOTES | ENT_HTML5, 'UTF-8'));
    return preg_replace('/\s+/u', ' ', $text) ?? $text;
}

function slugify(string $value): string
{
    $slug = strtolower(trim(preg_replace('/[^a-z0-9]+/i', '-', $value) ?? '', '-'));
    return $slug !== '' ? $slug : 'article-' . substr(sha1($value), 0, 10);
}

function category_from_title(string $title): string
{
    $lower = strtolower($title);

    return match (true) {
        str_contains($lower, 'transfer'), str_contains($lower, 'sign'), str_contains($lower, 'loan') => 'transfer',
        str_contains($lower, 'injury'), str_contains($lower, 'fitness') => 'injury',
        str_contains($lower, 'fixture'), str_contains($lower, 'result'), str_contains($lower, 'win') => 'match',
        default => 'news',
    };
}

function fetch_rss_news(array $source, int $limit = 20): array
{
    $feedUrl = (string) ($source['feed_url'] ?? '');
    if ($feedUrl === '') {
        return [];
    }

    $body = fetch_url($feedUrl);
    if ($body === null) {
        return [];
    }

    libxml_use_internal_errors(true);
    $xml = simplexml_load_string($body, 'SimpleXMLElement', LIBXML_NOCDATA | LIBXML_NONET);
    if ($xml === false || !isset($xml->channel->item)) {
        libxml_clear_errors();
        return [];
    }

    $items = [];
    $sourceName = (string) ($source['name'] ?? 'RSS Source');
    foreach ($xml->channel->item as $index => $item) {
        if (count($items) >= $limit) {
            break;
        }

        $title = clean_text((string) ($item->title ?? ''));
        $url = trim((string) ($item->link ?? ''));
        if ($title === '' || $url === '') {
            continue;
        }

        $summary = clean_text((string) ($item->description ?? ''));
        $publishedAt = strtotime((string) ($item->pubDate ?? '')) ?: time();

        $items[] = [
            'id' => $index + 1,
            'slug' => slugify($title),
            'title_th' => $title,
            'summary_th' => $summary,
            'category' => category_from_title($title),
            'source_name' => $sourceName,
            'source_type' => 'RSS',
            'original_url' => $url,
            'source_credit_text' => "สรุปหัวข้อข่าวจาก {$sourceName}",
            'published_at' => date(DATE_ATOM, $publishedAt),
        ];
    }

    libxml_clear_errors();
    return $items;
}

function live_news(): array
{
    $items = [];
    foreach (load_sources() as $source) {
        if (($source['type'] ?? '') !== 'rss') {
            continue;
        }

        $items = [...$items, ...fetch_rss_news($source)];
    }

    usort($items, static fn (array $a, array $b): int => strcmp((string) $b['published_at'], (string) $a['published_at']));
    return array_slice($items, 0, 20);
}

if ($path === '/api/rumors') {
    $data = read_mock_data('rumors');
    api_success($data, ['page' => 1, 'page_size' => 20, 'total' => count($data)]);
    exit;
}

if ($path === '/api/news') {
    $data = live_news();
    if ($data === []) {
        $data = read_mock_data('news');
    }

    api_success($data, ['page' => 1, 'page_size' => 20, 'total' => count($data)]);
    exit;
}

api_fail('Endpoint not found', 404);
