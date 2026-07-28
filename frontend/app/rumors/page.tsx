import { RumorCard } from "../../components/RumorCard";
import { getRumors } from "../../lib/api";

export const metadata = {
  title: "ข่าวลือ | beFootball",
  description: "ข่าวลือฟุตบอลพร้อม confidence score และ heat score",
};

export default async function RumorsPage() {
  const rumors = await getRumors();

  return (
    <main className="container single-page">
      <section className="panel page-card">
        <div className="panel-title">
          <div>
            <span className="mini-icon red">!</span>
            <h1>ข่าวลือ</h1>
          </div>
        </div>
        <div className="rumor-grid page-grid">
          {rumors.map((rumor) => (
            <RumorCard key={rumor.slug} rumor={rumor} />
          ))}
        </div>
      </section>
    </main>
  );
}
