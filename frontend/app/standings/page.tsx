export const metadata = {
  title: "ตารางคะแนน",
};

export default function StandingsPage() {
  return (
    <main className="container single-page">
      <section className="side-card page-card">
        <div className="side-title">
          <h1>ตารางคะแนน</h1>
          <span>EPL</span>
        </div>
        <table className="standing-table">
          <thead>
            <tr>
              <th>ทีม</th>
              <th>แข่ง</th>
              <th>แต้ม</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Arsenal</td>
              <td>0</td>
              <td>0</td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
  );
}
