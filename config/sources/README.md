# Real data source setup

1. Copy `.env.example` to `.env` and fill only keys that you received from an approved provider.
2. In `sources.json`, replace example endpoints/feed URLs with sources you are allowed to aggregate.
3. Set `enabled` to `true` only after confirming the provider's attribution, storage and display terms.
4. Keep `ENABLE_EXTERNAL_FETCH=false` until the backend worker is deployed and tested.

Source rules:

- RSS: public football RSS feeds with explicit permission or compatible terms.
- News API: a licensed API such as NewsAPI, GNews or Mediastack.
- Sports Data: a licensed fixture/result/standing provider such as API-Football, Sportmonks or football-data.org.
- X: official X API or allowed embeds only. Never scrape page HTML.
- Manual: editor must add source name, original URL and review status.

The `refresh_interval_seconds` value is per source. Start with 15 minutes for news, 5 minutes for live sports data and 10 minutes for X monitoring to remain within API quotas.
