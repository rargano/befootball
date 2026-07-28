export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return {
    title: `นักเตะ ${slug}`,
    description: "รวมข่าวและข่าวลือของนักเตะ",
  };
}

export default async function PlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <main className="container detail-layout">
      <section className="panel page-card">
        <div className="team-header">
          <span className="avatar large">BS</span>
          <div>
            <p className="breadcrumb">นักเตะ / {slug}</p>
            <h1>Bukayo Saka</h1>
            <p>ตำแหน่ง RW | รวมข่าว, ข่าวลือ และ entity relation</p>
          </div>
        </div>
      </section>
    </main>
  );
}
