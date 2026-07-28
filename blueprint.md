# beFootball Thai Football News Blueprint

เอกสารนี้สรุปจาก `prompt_build.txt` เพื่อใช้เป็นฐานพัฒนาเว็บข่าวฟุตบอลภาษาไทยด้วย Next.js, Yii2, MySQL, Redis และ AI

## 1. System Architecture

```text
RSS / News API / Sports Data API / X API / Manual Input
  -> Yii2 Console Workers
  -> MySQL raw tables
  -> Deduplication / Entity Extraction / Compliance Check
  -> AI Translation + Summary + Categorization
  -> Draft Article หรือ Pending Review Rumor
  -> Yii2 Admin CMS
  -> Publish
  -> Yii2 REST API
  -> Next.js Public Website
  -> Sitemap / Metadata / Social Preview
```

## 2. Database Schema

### Core News

- `sources`: `id`, `name`, `slug`, `type`, `feed_url`, `api_endpoint`, `trust_score`, `allow_fetch`, `allow_translate`, `allow_display`, `status`, `notes`, `created_at`, `updated_at`
- `raw_articles`: `id`, `source_id`, `original_url`, `url_hash`, `title_raw`, `body_raw`, `published_at`, `content_hash`, `fetch_status`, `created_at`
- `articles`: `id`, `slug`, `title_th`, `summary_th`, `body_th`, `category_id`, `status`, `published_at`, `seo_title`, `seo_description`, `og_image_url`, `created_at`, `updated_at`
- `article_sources`: `id`, `article_id`, `source_id`, `original_url`, `source_credit_text`
- `categories`: `id`, `name`, `slug`
- `teams`: `id`, `name`, `name_th`, `slug`, `league_id`, `logo_url`
- `players`: `id`, `name`, `name_th`, `slug`, `team_id`, `position`
- `leagues`: `id`, `name`, `name_th`, `slug`, `country`
- `fixtures`: `id`, `league_id`, `home_team_id`, `away_team_id`, `kickoff_at`, `status`
- `standings`: `id`, `league_id`, `team_id`, `season`, `played`, `won`, `drawn`, `lost`, `points`
- `translation_jobs`: `id`, `target_type`, `target_id`, `status`, `error_msg`, `created_at`, `finished_at`
- `audit_logs`: `id`, `actor_id`, `action`, `target_type`, `target_id`, `payload_json`, `created_at`

### Rumor

- `rumor_sources`: `id`, `name`, `platform`, `handle`, `trust_score`, `historical_accuracy`, `status`
- `raw_social_posts`: `id`, `rumor_source_id`, `platform_post_id`, `post_url`, `text_raw`, `engagement_count`, `posted_at`, `created_at`
- `rumors`: `id`, `slug`, `title_th`, `summary_th`, `status`, `confidence_score`, `heat_score`, `disclaimer`, `published_at`, `created_at`, `updated_at`
- `rumor_posts`: `id`, `rumor_id`, `raw_social_post_id`, `relation_type`
- `rumor_entities`: `id`, `rumor_id`, `entity_type`, `entity_id`, `confidence`
- `rumor_score_logs`: `id`, `rumor_id`, `confidence_score`, `heat_score`, `reason_json`, `created_at`
- `rumor_review_logs`: `id`, `rumor_id`, `admin_id`, `action`, `note`, `created_at`

## 3. Yii2 Folder Structure

```text
common/
  models/
  services/
  components/
  helpers/
backend/
  controllers/
  views/
api/
  controllers/
  modules/
  serializers/
console/
  controllers/
  jobs/
```

Services: `NewsFetcherService`, `RssParserService`, `NewsApiService`, `ArticleDedupService`, `TranslationService`, `EntityExtractService`, `CreditService`, `SeoService`, `RumorSourceService`, `XApiRumorFetcher`, `RumorFilterService`, `RumorGroupingService`, `RumorScoringService`, `RumorTranslationService`, `RumorComplianceService`, `RumorPublishingService`

## 4. Next.js Structure

```text
app/
  page.tsx
  news/page.tsx
  news/[slug]/page.tsx
  rumors/page.tsx
  rumors/[slug]/page.tsx
  team/[slug]/page.tsx
  player/[slug]/page.tsx
  league/[slug]/page.tsx
  fixtures/page.tsx
  results/page.tsx
  standings/page.tsx
  sitemap.ts
  robots.ts
components/
  Header.tsx
  Footer.tsx
  NewsCard.tsx
  RumorCard.tsx
  SourceCredit.tsx
  ScoreBadge.tsx
  TeamHeader.tsx
  PlayerHeader.tsx
  FixtureList.tsx
  StandingTable.tsx
lib/
  api.ts
  seo.ts
  format.ts
  types.ts
```

## 5. API Format

Success:

```json
{
  "status": "success",
  "data": {},
  "pagination": {},
  "error_msg": null
}
```

Error:

```json
{
  "status": "fail",
  "data": null,
  "error_msg": "ข้อความ error"
}
```

## 6. AI Prompt Summary

Article translation ต้องแปลและสรุปจาก source เท่านั้น ห้ามเพิ่มข้อมูลใหม่ ต้องคืน `title_th`, `summary_th`, `body_th`, `source_credit_text` เป็น JSON

Rumor summary ต้องไม่ยืนยันข่าวที่ยังไม่มี official confirmation ต้องแยก `fact`, `rumor`, `opinion`, `joke`, ระบุ `risk_flags` และเสนอ `confidence_score_suggestion`

## 7. Rumor Scoring

```text
confidence_score =
  source_trust_score
  + historical_accuracy
  + independent_source_bonus
  + entity_confidence
  + official_confirmation_bonus
  - contradiction_penalty
  - age_penalty

heat_score =
  post_count
  + engagement
  + source_count
  + velocity
  + freshness
```

## 8. Compliance

1. ทุกข่าวต้องมี `original_url`
2. ทุกข่าวต้องมี `source_name`
3. ทุกข่าวต้องมี `source_credit_text`
4. ห้าม publish ถ้าไม่มี source
5. ห้ามใช้รูปจาก source โดยไม่มีสิทธิ์
6. ห้ามเผยแพร่ full article ใหม่ถ้า source ไม่อนุญาต
7. X content ต้องใช้ผ่าน API/embed/วิธีที่ได้รับอนุญาต
8. ข่าวลือต้องมี disclaimer
9. ข่าวลือจากแหล่งเดียว default เป็น `monitoring`
10. ข่าวเสี่ยงสูงต้อง require human review

## 9. Cron Commands

```text
php yii news-fetch/run
php yii article-process/run
php yii article-translate/run
php yii rumor-fetch/x
php yii rumor-process/run
php yii rumor-score/run
php yii rumor-expire/run
php yii fixture-sync/run
php yii sitemap/generate
```

## 10. Roadmap

Phase 1: MVP Content Pipeline
Phase 2: Rumor Engine
Phase 3: Football Data
Phase 4: Scale & SEO
