export const metadata = {
  title: "ผลบอลสด",
};

export default function ResultsPage() {
  return (
    <main className="container single-page">
      <section className="side-card page-card">
        <div className="side-title">
          <h1>ผลบอลสด</h1>
          <span>LIVE</span>
        </div>
        <div className="fixture-list">
          <article className="fixture">
            <strong>เชลซี</strong>
            <span className="scoreline">2 - 1</span>
            <strong>สเปอร์ส</strong>
            <small>จบการแข่งขัน</small>
          </article>
        </div>
      </section>
    </main>
  );
}
