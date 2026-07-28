# Phase 2: System Foundation + Rumor Engine

เฟสนี้เพิ่มฐานสำหรับระบบจริงโดยยังไม่ทิ้ง static prototype เดิม

## เพิ่มแล้ว

- `backend/` โครง Yii2-style สำหรับ `common`, `api`, `backend`, `console`
- `database/migrations/` schema หลักของข่าวและข่าวลือ
- `frontend/` โครง Next.js App Router สำหรับ news/rumors/sitemap/robots
- `frontend/public/api/*.json` mock API สำหรับรัน Next.js แยกจาก static prototype
- `contracts/api/response-format.md` สัญญา JSON response
- `public/api/*.json` mock API สำหรับ frontend
- `docker-compose.yml` โครง local services: Next.js, PHP-FPM, Nginx, MySQL, Redis
- Rumor Engine service skeleton:
  - `RumorScoringService`
  - `RumorComplianceService`
  - `RumorGroupingService`
  - `RumorTranslationService`
- Compliance service:
  - `ArticleComplianceService`
- Source integration foundation:
  - `config/sources/sources.json` registry for RSS, News API, Sports Data API, X API and Manual Admin Input
  - `.env.example` for API keys and refresh policy
  - Fetcher interfaces for each source type and `SourceRegistryService`
  - `src/views/source-manager.html` admin prototype for source status

## ขั้นต่อไป

1. ติดตั้ง Yii2 Advanced Template จริงใน `backend/`
2. ติดตั้ง Next.js จริงใน `frontend/`
3. ต่อ API controller กับ ActiveRecord models
4. เพิ่ม queue worker สำหรับ fetch/process/score/translate
5. ย้าย mock API ไปฐานข้อมูล MySQL
6. ผูก HTTP client, queue worker และ ActiveRecord models เข้ากับ fetcher แต่ละชนิด
