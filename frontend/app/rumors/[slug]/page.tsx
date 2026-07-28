export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return {
    title: `ข่าวลือ ${slug}`,
    description: "รายละเอียดข่าวลือพร้อม confidence score และ disclaimer",
  };
}

export default async function RumorDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <main className="container detail-layout">
      <article className="article-shell">
        <div className="article-body">
          <p className="breadcrumb">ข่าวลือ / {slug}</p>
          <span className="status">heating_up</span>
          <h1>กองหน้าโปรตุเกสถูกเชื่อมโยงกับ 2 ทีมพรีเมียร์ลีก</h1>
          <p className="lead">ยังไม่มี official confirmation จากสโมสรหรือตัวแทนนักเตะ</p>
          <div className="score-row big">
            <span className="score confidence">Confidence 48</span>
            <span className="score heat">Heat 82</span>
          </div>
          <aside className="source-box warning">
            <strong>Disclaimer</strong>
            <span>ข่าวลือนี้ยังไม่ยืนยัน โปรดอ่านเป็นข้อมูลที่อยู่ระหว่างติดตาม</span>
          </aside>
        </div>
      </article>
    </main>
  );
}
