# beFootball Project Bible

อัปเดตล่าสุด: 28 กรกฎาคม 2026

เอกสารนี้คือคู่มือกลางของโปรเจกต์ beFootball สำหรับจำภาพรวมเว็บ, โครงสร้างไฟล์, แหล่งข้อมูลจริงที่ดึงมาใช้, วิธีรัน และแนวทางอัปขึ้น server

## เป้าหมายโปรเจกต์

beFootball เป็นเว็บข่าวฟุตบอลภาษาไทย โทนแดงดำ รันได้ด้วย JavaScript/Node โดยไม่ต้องลง PHP สำหรับเวอร์ชันที่ใช้งานอยู่ตอนนี้

ฟีเจอร์หลัก:

- หน้าแรกข่าวฟุตบอล พร้อม Hot News, ข่าวอัปเดต, ข่าวลือ, ตารางคะแนน, โปรแกรม/ถ่ายทอดสด และ X official embeds
- เลือกภาษาแสดงข่าวได้: ไทย หรือ ต้นฉบับ
- ปรับขนาด font ได้: A-, A, A+
- เมนู Admin Zone
- ข้อมูลจริงบางส่วนผ่าน RSS/API public endpoints
- fallback เป็น local JSON/mock data ถ้า API ล่ม

## วิธีรันในเครื่อง

ต้องมี Node.js

```bash
npm run serve
```

เปิดเว็บ:

```text
http://localhost:4173/src/views/index.html
```

ถ้า deploy บน server ให้ตั้ง `PORT` ได้ผ่าน environment:

```bash
PORT=4173 npm run serve
```

## Stack ที่ใช้อยู่จริง

- Static HTML/CSS/JS
- Node.js built-in HTTP server ที่ไฟล์ `server.js`
- ไม่มี PHP ใน runtime หลักตอนนี้
- ไม่มี database สำหรับ static JS version ตอนนี้
- ดึงข้อมูลฝั่ง server แล้วส่งให้ frontend ผ่าน `/api/*`

หมายเหตุ: ใน repo ยังมีโครง PHP/Next.js/SQL เก่าหรือเฟสถัดไปอยู่ เช่น `backend/`, `frontend/`, `database/` แต่ตัวที่กำลังใช้งานจริงคือ `server.js` + `src/views` + `src/controllers` + `public/assets`

## โครงสร้างไฟล์สำคัญ

```text
server.js
  Node server, static file routing, API proxy/fetcher, cache, fallback

src/views/
  หน้า HTML เช่น index.html, news.html, rumors.html, standings.html, teams.html, team-detail.html

src/controllers/home-controller.js
  frontend controller หลัก ดึง /api/* แล้ว render UI

src/controllers/ui-controller.js
  current date, font size controls, language toggle

src/models/mock-data.js
  mock data fallback ฝั่ง frontend

public/assets/css/styles.css
  theme แดงดำ, layout, responsive

public/assets/img/
  logo และ hero image

public/api/news.json
public/api/rumors.json
  local fallback JSON

config/sources/sources.json
  registry แหล่งข้อมูล RSS/API ที่ตั้งใจอนุญาตให้ใช้
```

## API ภายในเว็บ

ทุก endpoint ตอบรูปแบบประมาณนี้:

```json
{
  "status": "success",
  "data": [],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 20
  },
  "error_msg": null
}
```

รายการ endpoint:

| Endpoint | ใช้ทำอะไร | แหล่งข้อมูล |
| --- | --- | --- |
| `/api/news?lang=th` | ข่าว RSS แปลไทย | BBC + ESPN + Guardian RSS + Google Translate fallback |
| `/api/news?lang=original` | ข่าว RSS ต้นฉบับ | BBC + ESPN + Guardian RSS |
| `/api/rumors` | ข่าวลือ | local JSON fallback ตอนนี้ |
| `/api/standings/epl` | ตารางคะแนนพรีเมียร์ลีก | ESPN public standings |
| `/api/fixtures/epl` | โปรแกรมพรีเมียร์ลีก | ESPN public scoreboard |
| `/api/broadcasts/monomax` | รูปตารางถ่ายทอดสดฟุตบอลจาก Monomax | Monomax football program page |
| `/api/results/epl` | ผลบอลพรีเมียร์ลีก | ESPN public scoreboard |
| `/api/teams/epl` | รายชื่อทีมจากตารางคะแนน | ESPN public standings |
| `/api/teams/{teamId}/players` | roster นักเตะของทีม | ESPN public team roster |
| `/api/players/featured` | นักเตะเด่นรวม | static list ใน `server.js` |
| `/api/leagues` | รายชื่อลีกที่รองรับ | static list ใน `server.js` |

## แหล่ง RSS/API ที่ดึงจริง

### 1. Football news RSS feeds

ใช้สำหรับข่าวฟุตบอลล่าสุดจากหลายแหล่ง โดย fetch จาก source ที่ `enabled`, `allow_fetch`, `allow_display` และ `type = rss`

| Source | URL | Status |
| --- | --- | --- |
| BBC Sport Football | `https://feeds.bbci.co.uk/sport/football/rss.xml` | enabled |
| ESPN Soccer | `https://www.espn.com/espn/rss/soccer/news` | enabled |
| The Guardian Football | `https://www.theguardian.com/football/rss` | enabled |
| GioScore Football | ยังไม่พบ public RSS official ที่ตอบ 200 | disabled placeholder |

ไฟล์ config:

```text
config/sources/sources.json
```

ค่าหลัก:

- `type`: `rss`
- `enabled`: `true`
- `requires_api_key`: `false`
- `refresh_interval_seconds`: `900`
- `allow_fetch`: `true`
- `allow_display`: `true`
- ต้องมี attribution และ link กลับไปบทความต้นฉบับตามแต่ละ source

ข้อสังเกต:

- server ดึง 20 ข่าวต่อ source แล้ว dedupe ตาม URL/title
- รวมสูงสุด 60 ข่าวต่อรอบ cache
- ถ้า RSS source ใดล่ม จะ log warning และยังแสดงข่าวจาก source อื่นต่อ

ข้อมูลที่ map ออกมา:

- `title_original`
- `summary_original`
- `title_th`
- `summary_th`
- `category`
- `source_credit_text`
- `source_name`
- `source_type`
- `original_url`
- `published_at`

### 2. Google Translate public endpoint

ใช้แปลหัวข้อ/summary เป็นไทยแบบ best effort เมื่อเรียก:

```text
/api/news?lang=th
```

endpoint ที่ server ใช้:

```text
https://translate.googleapis.com/translate_a/single
```

หมายเหตุ:

- เป็น fallback แบบง่าย ไม่ใช่ contract ทางการสำหรับ production ระยะยาว
- ถ้าแปลล้มเหลว server จะคืนข้อความต้นฉบับแทน
- มี in-memory translation cache ใน runtime

### 3. ESPN public standings

ใช้ตารางคะแนนพรีเมียร์ลีกและรายชื่อทีม

```text
https://site.web.api.espn.com/apis/v2/sports/soccer/eng.1/standings?region=us&lang=en
```

ใช้กับ:

- `/api/standings/epl`
- `/api/teams/epl`
- หน้า standings
- หน้า teams
- team detail summary

ข้อมูลที่ map:

- `rank`
- `team_id`
- `team`
- `team_full`
- `logo`
- `played`
- `won`
- `drawn`
- `lost`
- `goal_difference`
- `points`

### 4. ESPN public scoreboard

ใช้โปรแกรมบอลและผลบอลพรีเมียร์ลีก

```text
https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard?dates=YYYYMMDD-YYYYMMDD
```

ใช้กับ:

- `/api/fixtures/epl`
- `/api/results/epl`

ช่วงวันที่:

- fixtures: วันนี้ถึง 60 วันข้างหน้า
- results: ย้อนหลัง 45 วันถึงวันนี้

ข้อมูลที่ map:

- `home_team`
- `away_team`
- `home_score`
- `away_score`
- `kickoff_at`
- `time`
- `date_label`
- `status`
- `completed`
- `live`

### 5. ESPN public team roster

ใช้รายชื่อนักเตะในหน้า team detail

```text
https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/teams/{teamId}/roster
```

ใช้กับ:

- `/api/teams/{teamId}/players`
- sidebar “นักเตะเด่น” ใน `team-detail.html`

ข้อมูลที่ map:

- `id`
- `name`
- `team`
- `position`
- `jersey`
- `profile_url`

### 6. Monomax football program page

ใช้สำหรับรูปตารางถ่ายทอดสดฟุตบอลจาก Monomax

```text
https://www.monomax.me/review/detail/football-program-2026
```

ใช้กับ:

- `/api/broadcasts/monomax`
- หน้า `fixtures.html`
- sidebar หน้าแรก “ตารางจาก Monomax”

หมายเหตุ:

- Monomax วางตารางในบทความเป็นรูปภาพ ไม่ใช่ text table
- ระบบจึงดึง URL รูปจากบทความและแสดงพร้อมเครดิต/ลิงก์กลับ ไม่แปลงเป็นคู่แข่งขันรายแมตช์
- ถ้าต้องการข้อมูลเป็น text จริงต้องต่อ API ทางการของผู้ให้บริการ หรือทำ OCR แยกต่างหาก

### 7. X official embeds

ใช้แสดงโพสต์/ไทม์ไลน์จากนักข่าว โดยใช้ official embed script ไม่ scrape

script:

```text
https://platform.twitter.com/widgets.js
```

รายชื่อที่ตั้งไว้ใน `src/controllers/home-controller.js`:

- Fabrizio Romano: `FabrizioRomano`
- David Ornstein: `David_Ornstein`
- Samuel Luckhurst: `samuelluckhurst`

ข้อจำกัด:

- เป็น official embeds จึงขึ้นกับ availability และ policy ของ X
- ไม่ได้ดึงข้อมูลเป็น JSON เข้า database
- ไม่ควร scrape หน้า X เอง

### 8. Local fallback JSON

ใช้เมื่อ live fetch ล้มเหลว หรือ endpoint ยังไม่ได้ต่อของจริง

```text
public/api/news.json
public/api/rumors.json
```

ข่าวลือ `/api/rumors` ตอนนี้ยังใช้ local fallback เป็นหลัก

## Cache ใน server.js

เป็น in-memory cache หายเมื่อ restart server

| ข้อมูล | ค่า cache |
| --- | --- |
| RSS news | 5 นาที |
| standings | 10 นาที |
| scoreboard | 10 นาที |
| translation | cache ตามข้อความระหว่าง runtime |

## หน้าเว็บหลัก

| หน้า | ไฟล์ |
| --- | --- |
| หน้าแรก | `src/views/index.html` |
| ข่าวประจำวัน | `src/views/news.html` |
| ข่าวลือ | `src/views/rumors.html` |
| ผลบอลสด | `src/views/results.html` |
| โปรแกรมบอล | `src/views/fixtures.html` |
| ตารางคะแนน | `src/views/standings.html` |
| ทีม | `src/views/teams.html` |
| รายละเอียดทีม | `src/views/team-detail.html?team=fulham` |
| นักเตะ | `src/views/players.html` |
| ลีก | `src/views/leagues.html` |
| Admin Zone | `src/views/admin.html` |
| Developer | `src/views/developer.html` |

## สถานะข้อมูลจริงตอนนี้

ใช้งานจริงแล้ว:

- ข่าว RSS จาก BBC Sport Football, ESPN Soccer และ The Guardian Football
- แปลไทย/ต้นฉบับสำหรับข่าว RSS
- ตารางคะแนน Premier League จาก ESPN
- โปรแกรม/ผลบอล Premier League จาก ESPN
- รูปตารางถ่ายทอดสดฟุตบอลจาก Monomax
- รายชื่อทีม Premier League จาก ESPN
- roster นักเตะรายทีมจาก ESPN
- X official embeds สำหรับนักข่าว

ยังเป็น fallback/static:

- ข่าวลือ JSON ภายใน
- นักเตะเด่นรวม `/api/players/featured`
- ลีกอื่นนอกจาก Premier League เป็น planned
- Article detail/player detail/league detail บางส่วนยังเป็น static content

## อัปขึ้น server ได้ไหม

ได้ แต่อย่าอัปแบบ static hosting ล้วน ถ้าต้องการให้ RSS/API ทำงานจริง

เหตุผล:

- หน้าเว็บเป็น static HTML/CSS/JS ก็จริง
- แต่การดึง RSS/API จริงถูกทำผ่าน `server.js`
- ถ้าอัปขึ้น hosting ที่เปิดได้แค่ `.html` เช่น static file hosting ธรรมดา endpoint `/api/*` จะไม่ทำงาน

รูปแบบ server ที่เหมาะ:

- VPS หรือ cloud VM ที่รัน Node.js ได้
- Render / Railway / Fly.io / DigitalOcean App Platform / Heroku-style Node service
- cPanel ที่รองรับ Node.js App
- Docker ได้ ถ้าตั้ง process เป็น `npm run serve`

สิ่งที่ต้องมีบน server:

- Node.js
- เปิด port ตาม environment เช่น `PORT=3000`
- reverse proxy เช่น Nginx ชี้ domain ไปที่ Node process
- process manager เช่น `pm2` หรือ systemd เพื่อให้รันต่อหลัง reboot

ตัวอย่างรันด้วย PM2:

```bash
npm install -g pm2
pm2 start server.js --name befootball --env production
pm2 save
```

ถ้าต้องการใช้ port:

```bash
PORT=3000 pm2 start server.js --name befootball
```

ตัวอย่าง Nginx reverse proxy:

```nginx
server {
  listen 80;
  server_name example.com www.example.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

## Production notes

ก่อนเปิดจริงควรทำเพิ่ม:

- เช็ก license/terms ของ BBC RSS, ESPN RSS, Guardian RSS และ ESPN public endpoints สำหรับการใช้งานจริงเชิงพาณิชย์
- ใช้ translation provider ที่มี contract ชัดเจน ถ้าจะเปิด production จริง
- เพิ่ม logging/error monitoring
- เพิ่ม persistent cache หรือ database ถ้าต้องการเก็บข่าวย้อนหลัง
- เพิ่ม admin workflow สำหรับข่าวลือและ manual input
- เพิ่ม sitemap/SEO dynamic ถ้าต้องการ index ข่าวจริง
- เพิ่ม HTTPS บน server

## คำสั่งตรวจพื้นฐาน

```bash
npm run check
```

ตรวจ API:

```bash
curl http://localhost:4173/api/news?lang=th
curl http://localhost:4173/api/standings/epl
curl http://localhost:4173/api/fixtures/epl
curl http://localhost:4173/api/teams/epl
curl http://localhost:4173/api/teams/370/players
```
