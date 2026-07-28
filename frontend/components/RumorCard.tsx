import type { Rumor } from "../lib/types";

export function RumorCard({ rumor }: { rumor: Rumor }) {
  return (
    <article className="rumor-card">
      <span className="status">{rumor.status}</span>
      <h3>{rumor.title_th}</h3>
      <p>{rumor.summary_th}</p>
      <span className="credit">
        Source:{" "}
        <a href={rumor.original_url} target="_blank" rel="noopener noreferrer">
          {rumor.source_name}
        </a>{" "}
        ({rumor.source_type})
      </span>
      <div className="score-row">
        <span className="score confidence">Confidence {rumor.confidence_score}</span>
        <span className="score heat">Heat {rumor.heat_score}</span>
      </div>
    </article>
  );
}
