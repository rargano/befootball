import type { Article } from "../lib/types";

export function NewsCard({ article }: { article: Article }) {
  return (
    <article className="news-item">
      <time className="news-time">{new Date(article.published_at).toLocaleTimeString("th-TH")}</time>
      <div>
        <h3>{article.title_th}</h3>
        <p>{article.summary_th}</p>
        <span className="credit">
          {article.source_credit_text} · Source:{" "}
          <a href={article.original_url} target="_blank" rel="noopener noreferrer">
            {article.source_name}
          </a>{" "}
          ({article.source_type})
        </span>
      </div>
      <span className="news-badge hot">{article.category}</span>
    </article>
  );
}
