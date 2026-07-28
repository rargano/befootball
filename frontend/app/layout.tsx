import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "beFootball",
    template: "%s | beFootball",
  },
  description: "เว็บข่าวฟุตบอลภาษาไทย ข่าวลือ โปรแกรมบอล ผลบอล และตารางคะแนน",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <header className="site-header">
          <div className="container masthead">
            <a className="brand" href="/">
              <span className="brand-ball">be</span>
              <span>
                <strong>beFootball</strong>
                <small>ได้รู้ความเคลื่อนไหว ก่อนเสียงนกหวีด</small>
              </span>
            </a>
          </div>
          <nav className="main-nav">
            <div className="container nav-scroll">
              <a href="/news">ข่าวประจำวัน</a>
              <a href="/rumors">ข่าวลือ</a>
              <a href="/fixtures">โปรแกรมบอล</a>
              <a href="/results">ผลบอลสด</a>
              <a href="/standings">ตารางคะแนน</a>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
