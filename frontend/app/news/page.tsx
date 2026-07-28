import { NewsCard } from "../../components/NewsCard";
import { getNews } from "../../lib/api";

export const metadata = {
  title: "ข่าวประจำวัน | beFootball",
  description: "ข่าวฟุตบอลล่าสุดพร้อมเครดิตแหล่งข่าว",
};

export default async function NewsPage() {
  const news = await getNews();

  return (
    <main className="container single-page">
      <section className="panel page-card">
        <div className="panel-title">
          <div>
            <span className="mini-icon">▦</span>
            <h1>ข่าวประจำวัน</h1>
          </div>
        </div>
        <div className="news-list static-list">
          {news.map((article) => (
            <NewsCard key={article.slug} article={article} />
          ))}
        </div>
      </section>
    </main>
  );
}
