export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return {
    title: `ทีม ${slug}`,
    description: "รวมข่าว ข่าวลือ โปรแกรม และนักเตะของทีม",
  };
}

export default async function TeamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <main className="container detail-layout">
      <section className="panel page-card">
        <div className="team-header">
          <span className="crest red large">FC</span>
          <div>
            <p className="breadcrumb">ทีม / {slug}</p>
            <h1>Arsenal</h1>
            <p>รวมข่าว, ข่าวลือ, โปรแกรม และนักเตะที่เกี่ยวข้องกับทีม</p>
          </div>
        </div>
      </section>
    </main>
  );
}
