export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return {
    title: `ลีก ${slug}`,
    description: "รวมข่าว ตารางคะแนน โปรแกรม และข่าวลือของลีก",
  };
}

export default async function LeaguePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <main className="container detail-layout">
      <section className="panel page-card">
        <div className="team-header">
          <span className="crest red large">PL</span>
          <div>
            <p className="breadcrumb">ลีก / {slug}</p>
            <h1>Premier League</h1>
            <p>รวมข่าว, ตารางคะแนน, โปรแกรม และข่าวลือของลีก</p>
          </div>
        </div>
      </section>
    </main>
  );
}
