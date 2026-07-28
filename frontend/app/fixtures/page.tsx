export const metadata = {
  title: "โปรแกรมบอล",
};

export default function FixturesPage() {
  return (
    <main className="container single-page">
      <section className="side-card page-card">
        <div className="side-title">
          <h1>โปรแกรมบอล</h1>
          <span>FIX</span>
        </div>
        <div className="fixture-list">
          <article className="fixture">
            <strong>แมนฯ ซิตี้</strong>
            <span className="scoreline">21:30</span>
            <strong>อาร์เซน่อล</strong>
            <small>Club friendly</small>
          </article>
        </div>
      </section>
    </main>
  );
}
