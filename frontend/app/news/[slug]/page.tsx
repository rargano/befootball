export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return {
    title: `ข่าว ${slug}`,
    description: "รายละเอียดข่าวฟุตบอลพร้อมเครดิตแหล่งข่าว",
  };
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <main className="container detail-layout">
      <article className="article-shell">
        <div className="article-body">
          <p className="breadcrumb">ข่าวประจำวัน / {slug}</p>
          <h1>ตลาดนักเตะเดือด: หลายทีมพรีเมียร์ลีกเร่งปิดดีลก่อนเปิดฤดูกาล</h1>
          <p className="lead">หลายสโมสรในพรีเมียร์ลีกกำลังเร่งประเมินข้อเสนอและโครงสร้างค่าเหนื่อย</p>
          <aside className="source-box">
            <strong>เครดิตแหล่งข่าว</strong>
            <span>สรุปจาก News API partner และ club update ที่ได้รับอนุญาต</span>
          </aside>
        </div>
      </article>
    </main>
  );
}
