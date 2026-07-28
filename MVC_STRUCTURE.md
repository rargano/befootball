# beFootball MVC Static Prototype Structure

โครงนี้ใช้กับ Phase 1 แบบ static prototype โดยแยกความรับผิดชอบตามแนว MVC เพื่อให้ย้ายต่อเป็น Next.js + Yii2 ได้ง่ายขึ้น

```text
webFTB/
  index.html                         # redirect เข้า view หลัก
  src/
    models/
      mock-data.js                   # Model: mock data สำหรับข่าว, ข่าวลือ, fixtures, standings
    controllers/
      home-controller.js             # Controller: render feed, filter, search, sidebar widgets
    views/
      index.html                     # View: หน้าแรก
      news.html                      # View: ข่าวประจำวัน
      article-detail.html            # View: รายละเอียดข่าว
      rumors.html                    # View: ข่าวลือ
      rumor-detail.html              # View: รายละเอียดข่าวลือ
      fixtures.html                  # View: โปรแกรมบอล
      results.html                   # View: ผลบอลสด
      standings.html                 # View: ตารางคะแนน
      teams.html / team-detail.html  # View: ทีมและรายละเอียดทีม
      players.html / player-detail.html
      leagues.html / league-detail.html
      login.html
      admin.html
      source-manager.html            # View: ตั้งค่าและติดตามแหล่งข้อมูล
      developer.html
  public/
    assets/
      css/
        styles.css                   # Shared presentation layer
```

กติกาเพิ่มไฟล์ต่อจากนี้:

- หน้า HTML ใหม่ให้สร้างใน `src/views/`
- ข้อมูล mock หรือ schema frontend ให้ใส่ใน `src/models/`
- JavaScript ที่ควบคุม UI หรือ render ข้อมูลให้ใส่ใน `src/controllers/`
- CSS, image, font, static asset ให้ใส่ใน `public/assets/`
- หน้า root ใช้เป็นทางเข้าเท่านั้น ไม่ใส่ business logic
- source registry และ API key อยู่ใน `config/sources/` และ `.env` แยกจาก static view
