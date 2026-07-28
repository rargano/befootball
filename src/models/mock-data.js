export const newsItems = [
  {
    time: "12:44",
    league: "England",
    title: "ปืนเร่งคุยเอเยนต์กองกลางเป้าหมาย หลังคู่แข่งเริ่มขยับข้อเสนอ",
    summary: "รายงานระบุว่าทีมงานซื้อขายกำลังประเมินค่าตัวและค่าเหนื่อย ก่อนตัดสินใจยื่นข้อเสนออย่างเป็นทางการ",
    source: "เครดิต: สรุปจาก BeFootball Source Partner",
    sourceName: "BeFootball Source Partner",
    sourceType: "News API",
    originalUrl: "https://example.com/source/premier-league-transfer-rush",
    badge: "transfer",
    hot: true,
  },
  {
    time: "12:18",
    league: "Spain",
    title: "ราชันเตรียมพักตัวหลักเกมอุ่นเครื่อง เพื่อจัด load ก่อนทัวร์นาเมนต์ใหญ่",
    summary: "สตาฟฟ์โค้ชต้องการลดความเสี่ยงอาการล้าของผู้เล่นที่เพิ่งกลับมาซ้อมเต็มรูปแบบ",
    source: "เครดิต: SportsData Feed + Club Update",
    sourceName: "SportsData Feed",
    sourceType: "Sports Data API",
    originalUrl: "https://example.com/source/club-fitness-update",
    badge: "fitness",
  },
  {
    time: "11:52",
    league: "Italy",
    title: "งูใหญ่เปิดโต๊ะต่อสัญญาแนวรับตัวเก๋า พร้อมปรับบทบาทในซีซันใหม่",
    summary: "สโมสรยังมองว่าเจ้าตัวมีประโยชน์ทั้งในสนามและห้องแต่งตัว แต่ต้องตกลงรายละเอียดโบนัสเพิ่มเติม",
    source: "เครดิต: European News Wire",
    sourceName: "European News Wire",
    sourceType: "RSS/API",
    originalUrl: "https://example.com/source/inter-contract-update",
    badge: "official",
  },
  {
    time: "10:56",
    league: "Germany",
    title: "เสือใต้ยังไม่ปิดประตูดีลปีกดาวรุ่ง แม้ค่าตัวสูงกว่างบที่ตั้งไว้",
    summary: "ดีลยังอยู่ในขั้น monitoring โดยฝ่ายวิเคราะห์ต้องการดูข้อมูลความฟิตเพิ่มเติม",
    source: "เครดิต: Bundesliga RSS Monitor",
    sourceName: "Bundesliga RSS Monitor",
    sourceType: "RSS",
    originalUrl: "https://example.com/source/bayern-winger-monitoring",
    badge: "monitoring",
  },
];

export const rumors = [
  {
    status: "heating_up",
    title: "กองหน้าโปรตุเกสถูกเชื่อมโยงกับ 2 ทีมพรีเมียร์ลีก",
    summary: "ยังไม่มีการยืนยันจากสโมสร ต้นทางเป็นโพสต์จากนักข่าวตลาดซื้อขายและถูกพูดถึงต่อหลายแหล่ง",
    sourceName: "Transfer Desk X List",
    sourceType: "Official X embed",
    originalUrl: "https://example.com/source/transfer-desk-x-list",
    confidence: 48,
    heat: 82,
  },
  {
    status: "monitoring",
    title: "มิดฟิลด์ทีมชาติไทยมีรายงานว่าได้รับความสนใจจากเจลีก",
    summary: "ข้อมูลยังมาจากแหล่งเดียว ระบบตั้งสถานะ monitoring และต้องรอ human review ก่อนเผยแพร่จริง",
    sourceName: "Manual Admin Input",
    sourceType: "Manual",
    originalUrl: "https://example.com/source/manual-rumor-note",
    confidence: 35,
    heat: 51,
  },
];

export const hotNews = [
  ["ตลาดอังกฤษเริ่มขยับหนัก หลายทีมเร่งปิดดีลก่อนทัวร์ปรีซีซัน", "England", "red"],
  ["วิเคราะห์ 5 ดาวรุ่งที่น่าจับตาในบอลยุโรปฤดูกาลนี้", "Europe", "green"],
  ["สรุปผลอุ่นเครื่องเมื่อคืน พร้อมประเด็นแท็กติกที่เห็นชัด", "All", ""],
];

export const fixtures = [
  ["บุรีรัมย์", "19:00", "บีจี ปทุม", "ไทยลีก"],
  ["แมนฯ ซิตี้", "21:30", "อาร์เซน่อล", "กระชับมิตร"],
  ["บาร์เซโลน่า", "02:00", "อินเตอร์", "Club friendly"],
];

export const standings = [
  ["Liverpool", 0, 0],
  ["Arsenal", 0, 0],
  ["Man City", 0, 0],
  ["Chelsea", 0, 0],
  ["Man United", 0, 0],
];

export const sourceRegistry = [
  {
    name: "BeFootball Source Partner",
    type: "News API",
    trustScore: 82,
    status: "active",
    lastFetched: "12:44",
  },
  {
    name: "SportsData Feed",
    type: "Sports Data API",
    trustScore: 90,
    status: "active",
    lastFetched: "12:18",
  },
  {
    name: "European News Wire",
    type: "RSS/API",
    trustScore: 76,
    status: "active",
    lastFetched: "11:52",
  },
  {
    name: "Bundesliga RSS Monitor",
    type: "RSS",
    trustScore: 68,
    status: "active",
    lastFetched: "10:56",
  },
  {
    name: "Transfer Desk X List",
    type: "Official X embed",
    trustScore: 61,
    status: "monitoring",
    lastFetched: "12:35",
  },
  {
    name: "Manual Admin Input",
    type: "Manual",
    trustScore: 50,
    status: "pending_review",
    lastFetched: "12:20",
  },
];
