export default function HomePage() {
  return (
    <main className="container single-page">
      <section className="panel page-card">
        <div className="panel-title">
          <div>
            <span className="mini-icon">be</span>
            <h1>beFootball Frontend</h1>
          </div>
        </div>
        <div className="developer-grid page-grid">
          <article>
            <strong>News</strong>
            <span>SSR/ISR feed จาก Yii2 API</span>
          </article>
          <article>
            <strong>Rumor</strong>
            <span>Confidence + heat score พร้อม disclaimer</span>
          </article>
          <article>
            <strong>SEO</strong>
            <span>Metadata, sitemap, robots, structured data</span>
          </article>
        </div>
      </section>
    </main>
  );
}
