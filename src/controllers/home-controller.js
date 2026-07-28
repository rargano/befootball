import { fixtures, hotNews, newsItems, rumors, sourceRegistry, standings } from "../models/mock-data.js";

const newsList = document.querySelector("#newsList");
const leagueFilter = document.querySelector("#leagueFilter");
const autoRefreshSelect = document.querySelector("#autoRefreshSeconds");
let autoRefreshTimer = null;
let currentNewsItems = newsItems;
let currentRumors = rumors;
let currentFixtureItems = [];
let currentNewsPage = 1;
let currentRumorPage = 1;
let languageMode = localStorage.getItem("befootball-news-language") ?? "th";
const xJournalists = [
  { name: "Fabrizio Romano", handle: "FabrizioRomano" },
  { name: "David Ornstein", handle: "David_Ornstein" },
  { name: "Samuel Luckhurst", handle: "samuelluckhurst" },
];

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const api = {
  async getNews() {
    const response = await fetch(`/api/news?lang=${languageMode}`, { cache: "no-store" });
    if (!response.ok) throw new Error("News API failed");
    const json = await response.json();
    if (json.status !== "success" || !Array.isArray(json.data)) throw new Error("Invalid news response");
    return json.data.map(mapArticle);
  },
  async getRumors() {
    const response = await fetch("/api/rumors", { cache: "no-store" });
    if (!response.ok) throw new Error("Rumor API failed");
    const json = await response.json();
    if (json.status !== "success" || !Array.isArray(json.data)) throw new Error("Invalid rumor response");
    return json.data.map(mapRumor);
  },
  async getStandings() {
    const response = await fetch("/api/standings/epl", { cache: "no-store" });
    if (!response.ok) throw new Error("Standings API failed");
    const json = await response.json();
    if (json.status !== "success" || !Array.isArray(json.data)) throw new Error("Invalid standings response");
    return json.data;
  },
  async getFixtures() {
    const response = await fetch("/api/fixtures/epl", { cache: "no-store" });
    if (!response.ok) throw new Error("Fixtures API failed");
    const json = await response.json();
    if (json.status !== "success" || !Array.isArray(json.data)) throw new Error("Invalid fixtures response");
    return json.data;
  },
  async getMonomaxBroadcasts() {
    const response = await fetch("/api/broadcasts/monomax", { cache: "no-store" });
    if (!response.ok) throw new Error("Monomax broadcasts API failed");
    const json = await response.json();
    if (json.status !== "success" || !Array.isArray(json.data)) throw new Error("Invalid Monomax broadcasts response");
    return json.data;
  },
  async getResults() {
    const response = await fetch("/api/results/epl", { cache: "no-store" });
    if (!response.ok) throw new Error("Results API failed");
    const json = await response.json();
    if (json.status !== "success" || !Array.isArray(json.data)) throw new Error("Invalid results response");
    return json.data;
  },
  async getTeams() {
    const response = await fetch("/api/teams/epl", { cache: "no-store" });
    if (!response.ok) throw new Error("Teams API failed");
    const json = await response.json();
    if (json.status !== "success" || !Array.isArray(json.data)) throw new Error("Invalid teams response");
    return json.data;
  },
  async getPlayers() {
    const response = await fetch("/api/players/featured", { cache: "no-store" });
    if (!response.ok) throw new Error("Players API failed");
    const json = await response.json();
    if (json.status !== "success" || !Array.isArray(json.data)) throw new Error("Invalid players response");
    return json.data;
  },
  async getTeamPlayers(teamId) {
    if (!teamId) return [];
    const response = await fetch(`/api/teams/${teamId}/players`, { cache: "no-store" });
    if (!response.ok) throw new Error("Team players API failed");
    const json = await response.json();
    if (json.status !== "success" || !Array.isArray(json.data)) throw new Error("Invalid team players response");
    return json.data;
  },
  async getLeagues() {
    const response = await fetch("/api/leagues", { cache: "no-store" });
    if (!response.ok) throw new Error("Leagues API failed");
    const json = await response.json();
    if (json.status !== "success" || !Array.isArray(json.data)) throw new Error("Invalid leagues response");
    return json.data;
  },
};

function mapArticle(article) {
  const published = article.published_at ? new Date(article.published_at) : new Date();
  const inferredLeague = inferArticleLeague(article);

  return {
    time: Number.isNaN(published.getTime()) ? "--:--" : published.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
    league: article.league ?? inferredLeague,
    title: article.title_th,
    summary: article.summary_th,
    originalTitle: article.title_original ?? article.title_th,
    originalSummary: article.summary_original ?? article.summary_th,
    source: article.source_credit_text,
    sourceName: article.source_name,
    sourceType: article.source_type,
    originalUrl: article.original_url,
    badge: article.category ?? "news",
    hot: article.category === "transfer",
  };
}

function inferArticleLeague(article) {
  const haystack = `${article.title_original ?? article.title_th ?? ""} ${article.summary_original ?? article.summary_th ?? ""}`.toLowerCase();
  const leagueRules = [
    ["England", /\b(premier league|championship|efl|fa cup|carabao|arsenal|chelsea|liverpool|man city|manchester city|man united|manchester united|tottenham|spurs|newcastle|aston villa|brighton|brentford|bournemouth|fulham|everton|leeds|sunderland|nottingham forest|crystal palace|wolves|west ham|burnley|norwich|southampton)\b/],
    ["Spain", /\b(la liga|laliga|real madrid|barcelona|atletico|athletic club|sevilla|valencia|villarreal|real sociedad|betis)\b/],
    ["Italy", /\b(serie a|inter milan|\binter\b|ac milan|\bmilan\b|juventus|napoli|roma|lazio|atalanta|fiorentina|italy|italian)\b/],
    ["Germany", /\b(bundesliga|bayern|borussia|dortmund|leverkusen|rb leipzig|eintracht|stuttgart|wolfsburg|germany|german)\b/],
  ];
  const match = leagueRules.find(([, pattern]) => pattern.test(haystack));
  return match?.[0] ?? "All";
}

function mapRumor(rumor) {
  return {
    status: rumor.status,
    title: rumor.title_th,
    summary: rumor.summary_th,
    sourceName: rumor.source_name,
    sourceType: rumor.source_type,
    originalUrl: rumor.original_url,
    confidence: rumor.confidence_score,
    heat: rumor.heat_score,
  };
}

function renderNews(filter = "All") {
  if (!newsList) return;

  const filtered = filter === "All" ? currentNewsItems : currentNewsItems.filter((item) => item.league === filter);
  const pageSize = newsPagination ? 20 : filtered.length;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  currentNewsPage = Math.min(Math.max(currentNewsPage, 1), totalPages);
  const pageItems = filtered.slice((currentNewsPage - 1) * pageSize, currentNewsPage * pageSize);

  newsList.innerHTML = pageItems.length
    ? pageItems
    .map(
      (item) => `
        <article class="news-item">
          <time class="news-time">${item.time}</time>
          <div>
            <h3><a href="article-detail.html">${item.title}</a></h3>
            <p>${item.summary}</p>
            <span class="credit">${item.source} · Source: <a href="${item.originalUrl}" target="_blank" rel="noopener">${item.sourceName}</a> (${item.sourceType})</span>
          </div>
          <span class="news-badge ${item.hot ? "hot" : ""}">${item.badge}</span>
        </article>
      `,
    )
    .join("")
    : `<article class="news-item"><time class="news-time">-</time><div><h3>ยังไม่มีข่าวในหมวดนี้</h3><p>ข่าว RSS บางชิ้นไม่มีข้อมูลลีกชัดเจน ระบบจะแยกจากชื่อทีม/ลีกเมื่อพบ keyword ที่ตรงกัน</p></div><span class="news-badge">${filter}</span></article>`;

  renderNewsPagination(totalPages);
}

const newsPagination = document.querySelector("#newsPagination");
function renderNewsPagination(totalPages) {
  if (!newsPagination) return;

  const links = Array.from({ length: totalPages }, (_, index) => {
    const page = index + 1;
    return `<a class="${page === currentNewsPage ? "active" : ""}" href="#" data-news-page="${page}">${page}</a>`;
  });
  if (currentNewsPage > 1) {
    links.unshift(`<a href="#" data-news-page="${currentNewsPage - 1}">ก่อนหน้า</a>`);
  }
  if (currentNewsPage < totalPages) {
    links.push(`<a href="#" data-news-page="${currentNewsPage + 1}">ถัดไป</a>`);
  }

  newsPagination.innerHTML = links.join("");
}

const hotNewsNode = document.querySelector("#hotNews");
const leadStory = document.querySelector(".lead-story");
function renderHotNews(items = currentNewsItems) {
  if (!hotNewsNode && !leadStory) return;

  const data = items.length
    ? items
    : newsItems;
  const lead = data[0];

  if (leadStory && lead) {
    const title = leadStory.querySelector(".lead-copy h1 a");
    const summary = leadStory.querySelector(".lead-copy p");
    const tag = leadStory.querySelector(".tag");
    if (title) {
      title.textContent = lead.title;
      title.href = "article-detail.html";
    }
    if (summary) summary.textContent = lead.summary;
    if (tag) tag.textContent = lead.badge?.toUpperCase?.() ?? "HOT NEWS";
  }

  if (!hotNewsNode) return;

  hotNewsNode.innerHTML = data
    .slice(1, 4)
    .map((item, index) => {
      const tone = index === 0 ? "red" : index === 1 ? "green" : "";
      return `
        <article class="hot-card">
          <span class="thumb ${tone}"></span>
          <div>
            <small>${item.sourceName ?? item.league ?? "RSS"}</small>
            <h3><a href="article-detail.html">${item.title}</a></h3>
          </div>
        </article>
      `;
    })
    .join("");
}

const rumorGrid = document.querySelector("#rumorGrid");
const rumorPagination = document.querySelector("#rumorPagination");
function renderRumors() {
  if (!rumorGrid) return;

  const pageSize = rumorGrid.classList.contains("rumor-page-grid") ? 18 : currentRumors.length;
  const totalPages = Math.max(1, Math.ceil(currentRumors.length / pageSize));
  currentRumorPage = Math.min(Math.max(currentRumorPage, 1), totalPages);
  const pageItems = currentRumors.slice((currentRumorPage - 1) * pageSize, currentRumorPage * pageSize);

  rumorGrid.innerHTML = pageItems
    .map(
      (rumor) => `
        <article class="rumor-card">
          <span class="status">${rumor.status}</span>
          <h3><a href="rumor-detail.html">${rumor.title}</a></h3>
          <p>${rumor.summary}</p>
          <span class="credit">Source: <a href="${rumor.originalUrl}" target="_blank" rel="noopener">${rumor.sourceName}</a> (${rumor.sourceType})</span>
          <div class="score-row">
            <span class="score confidence">Confidence ${rumor.confidence}</span>
            <span class="score heat">Heat ${rumor.heat}</span>
          </div>
        </article>
      `,
    )
    .join("");

  renderRumorPagination(totalPages);
  renderXEmbeds();
}

function renderRumorPagination(totalPages) {
  if (!rumorPagination) return;

  const links = Array.from({ length: totalPages }, (_, index) => {
    const page = index + 1;
    return `<a class="${page === currentRumorPage ? "active" : ""}" href="#" data-rumor-page="${page}">${page}</a>`;
  });
  if (currentRumorPage < totalPages) {
    links.push(`<a href="#" data-rumor-page="${currentRumorPage + 1}">ถัดไป</a>`);
  }

  rumorPagination.innerHTML = links.join("");
}

function loadXWidgets() {
  if (window.twttr?.widgets) {
    window.twttr.widgets.load();
    return;
  }

  if (document.querySelector("script[data-x-widgets]")) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://platform.twitter.com/widgets.js";
  script.charset = "utf-8";
  script.dataset.xWidgets = "true";
  document.body.append(script);
}

function renderXEmbeds() {
  const section = rumorGrid.closest(".panel");
  if (!section || section.querySelector(".x-embed-panel")) {
    loadXWidgets();
    return;
  }

  const panel = document.createElement("section");
  panel.className = "x-embed-panel";
  panel.innerHTML = `
    <div class="panel-title compact">
      <div>
        <span class="mini-icon red">X</span>
        <h2>ข่าวล่าสุดบน X</h2>
      </div>
      <span class="embed-note">ล่าสุด 2 โพสต์ต่อบัญชี · Official embeds</span>
    </div>
    <div class="x-embed-grid">
      ${xJournalists
        .map(
          (journalist) => `
            <article class="x-embed-card">
              <strong class="x-source-name">${journalist.name}</strong>
              <a
                class="twitter-timeline"
                data-theme="dark"
                data-chrome="noheader nofooter noborders transparent"
                data-height="520"
                data-tweet-limit="2"
                data-dnt="true"
                href="https://twitter.com/${journalist.handle}?ref_src=twsrc%5Etfw"
              >${journalist.name} latest posts on X</a>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
  section.append(panel);
  loadXWidgets();
}

const fixtureList = document.querySelector("#fixtureList");
const resultsList = document.querySelector("#resultsList");
const monomaxBroadcastList = document.querySelector("#monomaxBroadcastList");
function renderMatchList(node, rows = []) {
  if (!node) return;

  const fallback = fixtures.map(([home, time, away, league]) => ({
    home_team: home,
    away_team: away,
    time,
    date_label: "",
    status: league,
  }));
  const data = rows.length ? rows : fallback;

  node.innerHTML = data.length
    ? data
      .slice(0, node === fixtureList ? 8 : 12)
      .map((match) => {
        const scoreline = match.completed ? `${match.home_score} - ${match.away_score}` : match.time;
        const meta = [match.date_label, match.status, match.league].filter(Boolean).join(" · ");

        return `
        <article class="fixture">
          <strong>${match.home_team}</strong>
          <span class="scoreline">${scoreline}</span>
          <strong>${match.away_team}</strong>
          <small>${meta}</small>
        </article>
      `;
      })
      .join("")
    : `<article class="fixture empty-state"><strong>ยังไม่มีข้อมูล</strong><span class="scoreline">-</span><strong>Premier League</strong><small>ไม่พบรายการในช่วงวันที่ที่ดึงข้อมูล</small></article>`;
}

function renderMonomaxBroadcasts(rows = []) {
  if (!monomaxBroadcastList) return;

  monomaxBroadcastList.innerHTML = rows.length
    ? rows
      .map(
        (item) => `
        <article class="broadcast-card">
          <a href="${item.source_url}" target="_blank" rel="noopener" aria-label="${item.title}">
            <img src="${item.image_url}" alt="${item.title}" loading="lazy" />
          </a>
          <div>
            <strong>${item.title}</strong>
            <small>${item.source_credit_text} · <a href="${item.source_url}" target="_blank" rel="noopener">เปิดต้นฉบับ</a></small>
          </div>
        </article>
      `,
      )
      .join("")
    : `<article class="broadcast-card empty-state"><div><strong>ยังไม่มีตารางจาก Monomax</strong><small>ไม่พบรูปตารางในบทความต้นทางตอนนี้</small></div></article>`;
}

const standingRows = document.querySelector("#standingRows");
function renderStandings(rows = standings.map(([team, played, points], index) => ({ rank: index + 1, team, played, points }))) {
  if (!standingRows) return;

  const hasWonColumn = standingRows.closest("table")?.querySelectorAll("thead th").length === 4;
  standingRows.innerHTML = rows
    .slice(0, hasWonColumn ? 20 : 8)
    .map(
      (row) => `
        <tr>
          <td><span class="rank">${row.rank}</span>${row.team}</td>
          <td>${row.played}</td>
          ${hasWonColumn ? `<td>${row.won ?? 0}</td>` : ""}
          <td>${row.points}</td>
        </tr>
      `,
    )
    .join("");
}

const teamsGrid = document.querySelector("#teamsGrid");
function renderTeams(rows = []) {
  if (!teamsGrid) return;

  const data = rows.length
    ? rows
    : standings.map(([team, played, points], index) => ({ rank: index + 1, name: team, league: "Premier League", played, points }));

  teamsGrid.innerHTML = data
    .slice(0, 20)
    .map((team) => `
      <a class="entity-card" href="team-detail.html?team=${slugify(team.name)}">
        <span class="crest red">${team.logo ? `<img src="${team.logo}" alt="" />` : team.name.slice(0, 2)}</span>
        <strong>${team.name}</strong>
        <small>${team.league} · อันดับ ${team.rank} · ${team.points} แต้ม</small>
      </a>
    `)
    .join("");
}

const playersGrid = document.querySelector("#playersGrid");
function renderPlayers(rows = []) {
  if (!playersGrid) return;

  const data = rows.length
    ? rows
    : [
      { name: "Bukayo Saka", team: "Arsenal", position: "RW", profile_url: "player-detail.html" },
      { name: "Erling Haaland", team: "Man City", position: "ST", profile_url: "player-detail.html" },
      { name: "Mohamed Salah", team: "Liverpool", position: "RW", profile_url: "player-detail.html" },
    ];

  playersGrid.innerHTML = data
    .map((player) => `
      <a class="entity-card" href="${player.profile_url}">
        <span class="avatar">${player.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span>
        <strong>${player.name}</strong>
        <small>${player.team} | ${player.position}</small>
      </a>
    `)
    .join("");
}

const leaguesGrid = document.querySelector("#leaguesGrid");
function renderLeagues(rows = []) {
  if (!leaguesGrid) return;

  const data = rows.length
    ? rows
    : [
      { code: "eng.1", name: "Premier League", country: "England", status: "live", source: "ESPN public data" },
      { code: "esp.1", name: "LaLiga", country: "Spain", status: "planned", source: "เตรียมต่อข้อมูล" },
      { code: "ita.1", name: "Serie A", country: "Italy", status: "planned", source: "เตรียมต่อข้อมูล" },
      { code: "ger.1", name: "Bundesliga", country: "Germany", status: "planned", source: "เตรียมต่อข้อมูล" },
    ];

  leaguesGrid.innerHTML = data
    .map((league) => `
      <a class="entity-card" href="league-detail.html?league=${encodeURIComponent(league.code)}">
        <span class="crest ${league.status === "live" ? "red" : ""}">${league.code.split(".")[0].toUpperCase()}</span>
        <strong>${league.name}</strong>
        <small>${league.country} · ${league.status === "live" ? "เชื่อมข้อมูลแล้ว" : "รอต่อข้อมูล"} · ${league.source}</small>
      </a>
    `)
    .join("");
}

const leagueDetail = document.querySelector("#leagueDetail");
function renderLeagueDetail(standingsRows = [], leagueRows = []) {
  if (!leagueDetail) return;

  const params = new URLSearchParams(window.location.search);
  const selectedCode = params.get("league") ?? "eng.1";
  const fallbackLeagues = [
    { code: "eng.1", name: "Premier League", country: "England", status: "live", source: "ESPN public data" },
    { code: "esp.1", name: "LaLiga", country: "Spain", status: "planned", source: "เตรียมต่อข้อมูล" },
    { code: "ita.1", name: "Serie A", country: "Italy", status: "planned", source: "เตรียมต่อข้อมูล" },
    { code: "ger.1", name: "Bundesliga", country: "Germany", status: "planned", source: "เตรียมต่อข้อมูล" },
  ];
  const leagues = leagueRows.length ? leagueRows : fallbackLeagues;
  const league = leagues.find((item) => item.code === selectedCode) ?? leagues[0];
  const title = leagueDetail.querySelector("#leagueDetailName");
  const meta = leagueDetail.querySelector("#leagueDetailMeta");
  const summary = leagueDetail.querySelector("#leagueDetailSummary");
  const crest = leagueDetail.querySelector("#leagueDetailCrest");
  const rows = leagueDetail.querySelector("#leagueStandingRows");
  const news = leagueDetail.querySelector("#leagueNewsList");

  document.title = `${league.name} | beFootball`;
  if (title) title.textContent = league.name;
  if (meta) meta.innerHTML = `<a href="leagues.html">ลีก</a> / ${league.country}`;
  if (summary) {
    summary.textContent = league.status === "live"
      ? `${league.name} เชื่อมข้อมูล standings และโปรแกรมจาก ${league.source}`
      : `${league.name} อยู่ในแผนต่อข้อมูลเพิ่ม ตอนนี้แสดงสถานะลีกไว้ก่อน`;
  }
  if (crest) crest.textContent = league.code.split(".")[0].toUpperCase();

  if (rows) {
    rows.innerHTML = standingsRows.length && league.code === "eng.1"
      ? standingsRows.slice(0, 20).map((row) => `
        <tr>
          <td><span class="rank">${row.rank}</span><a href="team-detail.html?team=${slugify(row.team)}">${row.team}</a></td>
          <td>${row.played}</td>
          <td>${row.won ?? 0}</td>
          <td>${row.points}</td>
        </tr>
      `).join("")
      : `<tr><td colspan="4">ยังไม่มี standings live สำหรับลีกนี้</td></tr>`;
  }

  if (news) {
    const related = currentNewsItems
      .filter((item) => league.code === "eng.1" ? item.league === "England" : item.league === "All")
      .slice(0, 5);
    news.innerHTML = related.length
      ? related.map((item) => `
        <a href="article-detail.html">
          ${item.title}
          <small>${item.sourceName ?? "RSS"} · ${item.badge}</small>
        </a>
      `).join("")
      : `<span class="empty-copy">ยังไม่มีข่าวที่จับคู่กับลีกนี้</span>`;
  }
}

const teamDetail = document.querySelector("#teamDetail");
async function renderTeamDetail(rows = [], fixtureRows = currentFixtureItems) {
  if (!teamDetail) return;

  const teamParam = new URLSearchParams(window.location.search).get("team") ?? "arsenal";
  const team = rows.find((row) => slugify(row.name) === teamParam || slugify(row.full_name ?? "") === teamParam)
    ?? rows.find((row) => slugify(row.name) === "arsenal")
    ?? rows[0];
  if (!team) return;

  document.title = `${team.name} | beFootball`;
  const crest = teamDetail.querySelector("#teamDetailCrest");
  const title = teamDetail.querySelector("#teamDetailName");
  const meta = teamDetail.querySelector("#teamDetailMeta");
  const summary = teamDetail.querySelector("#teamDetailSummary");
  const stats = teamDetail.querySelector("#teamDetailStats");

  if (crest) {
    crest.innerHTML = team.logo ? `<img src="${team.logo}" alt="" />` : team.name.slice(0, 2);
  }
  if (title) title.textContent = team.name;
  if (meta) meta.textContent = `ทีม / Premier League / อันดับ ${team.rank}`;
  if (summary) summary.textContent = `${team.name} อยู่ในอันดับ ${team.rank} ของ Premier League จากข้อมูล standings ล่าสุด แข่ง ${team.played} นัด มี ${team.points} แต้ม`;
  if (stats) {
    stats.innerHTML = `
      <article><strong>${team.rank}</strong><small>อันดับ</small></article>
      <article><strong>${team.played}</strong><small>แข่ง</small></article>
      <article><strong>${team.points}</strong><small>แต้ม</small></article>
    `;
  }

  renderTeamDetailPanels(team, fixtureRows);
  await renderTeamDetailPlayers(team);
}

function teamSearchTerms(team) {
  const aliases = {
    "man united": ["man united", "manchester united", "utd", "red devils"],
    "man city": ["man city", "manchester city", "city"],
    "spurs": ["spurs", "tottenham", "tottenham hotspur"],
    "c palace": ["c palace", "crystal palace", "palace"],
    "nottm forest": ["nottm forest", "nottingham forest", "forest"],
  };
  const base = [team.name, team.full_name, team.team, team.team_full]
    .filter(Boolean)
    .map((value) => value.toLowerCase());
  return [...new Set([...base, ...(aliases[slugify(team.name).replace(/-/g, " ")] ?? [])])];
}

function textMatchesTerms(text, terms) {
  const normalized = text.toLowerCase();
  return terms.some((term) => term && normalized.includes(term));
}

function renderTeamDetailPanels(team, fixtureRows = []) {
  const newsPanel = document.querySelector("#team-news");
  const rumorPanel = document.querySelector("#team-rumors");
  const fixturePanel = document.querySelector("#team-fixtures");
  const terms = teamSearchTerms(team);

  if (newsPanel) {
    const relatedNews = currentNewsItems
      .filter((item) => textMatchesTerms(`${item.title} ${item.summary} ${item.originalTitle} ${item.originalSummary}`, terms))
      .slice(0, 8);
    const fallbackNews = currentNewsItems.filter((item) => item.league === "England").slice(0, 5);
    const data = relatedNews.length ? relatedNews : fallbackNews;
    newsPanel.innerHTML = data.length
      ? `<div class="news-list static-list">${data.map((item) => `
        <article class="news-item">
          <time class="news-time">${item.time}</time>
          <div>
            <h3><a href="article-detail.html">${item.title}</a></h3>
            <p>${item.summary}</p>
            <span class="credit">${item.source} · Source: <a href="${item.originalUrl}" target="_blank" rel="noopener">${item.sourceName}</a> (${item.sourceType})</span>
          </div>
          <span class="news-badge ${item.hot ? "hot" : ""}">${relatedNews.length ? "team" : item.badge}</span>
        </article>
      `).join("")}</div>`
      : `<div class="empty-copy tab-empty">ยังไม่มีข่าวที่เกี่ยวข้องกับทีมนี้</div>`;
  }

  if (rumorPanel) {
    const relatedRumors = currentRumors
      .filter((rumor) => textMatchesTerms(`${rumor.title} ${rumor.summary}`, terms))
      .slice(0, 8);
    const data = relatedRumors.length ? relatedRumors : currentRumors.slice(0, 6);
    rumorPanel.innerHTML = data.length
      ? `<div class="rumor-grid team-rumor-grid">${data.map((rumor) => `
        <article class="rumor-card">
          <span class="status">${rumor.status}</span>
          <h3><a href="rumor-detail.html">${rumor.title}</a></h3>
          <p>${rumor.summary}</p>
          <span class="credit">Source: <a href="${rumor.originalUrl}" target="_blank" rel="noopener">${rumor.sourceName}</a> (${rumor.sourceType})</span>
          <div class="score-row">
            <span class="score confidence">Confidence ${rumor.confidence}</span>
            <span class="score heat">Heat ${rumor.heat}</span>
          </div>
        </article>
      `).join("")}</div>`
      : `<div class="empty-copy tab-empty">ยังไม่มีข่าวลือสำหรับทีมนี้</div>`;
  }

  if (fixturePanel) {
    const relatedFixtures = fixtureRows
      .filter((match) => textMatchesTerms(`${match.home_team} ${match.away_team}`, terms))
      .slice(0, 10);
    fixturePanel.innerHTML = relatedFixtures.length
      ? `<div class="fixture-list">${relatedFixtures.map((match) => {
        const scoreline = match.completed ? `${match.home_score} - ${match.away_score}` : match.time;
        const meta = [match.date_label, match.status, match.league].filter(Boolean).join(" · ");
        return `
          <article class="fixture">
            <strong>${match.home_team}</strong>
            <span class="scoreline">${scoreline}</span>
            <strong>${match.away_team}</strong>
            <small>${meta}</small>
          </article>
        `;
      }).join("")}</div>`
      : `<div class="empty-copy tab-empty">ยังไม่มีโปรแกรมของทีมนี้ในช่วงวันที่ที่ดึงข้อมูล</div>`;
  }
}

async function renderTeamDetailPlayers(team) {
  const list = document.querySelector("#teamPlayersList");
  if (!list) return;

  try {
    const players = await api.getTeamPlayers(team.team_id);
    const data = players.length ? players : [];
    list.innerHTML = data.length
      ? data
        .slice(0, 6)
        .map((player) => `<a href="${player.profile_url}">${player.jersey ? `#${player.jersey} ` : ""}${player.name}<small>${player.position}</small></a>`)
        .join("")
      : `<span class="empty-copy">ไม่พบ roster จาก ESPN สำหรับทีมนี้</span>`;
  } catch (error) {
    console.warn(`Using empty team player list: ${error.message}`);
    list.innerHTML = `<span class="empty-copy">โหลดนักเตะเด่นไม่สำเร็จ</span>`;
  }
}

const euroList = document.querySelector("#euroList");
if (euroList) {
  euroList.innerHTML = currentNewsItems
    .slice(0, 4)
    .map((item) => `<a href="article-detail.html">${item.title}</a>`)
    .join("");
}

const sourceList = document.querySelector("#sourceList");
if (sourceList) {
  sourceList.innerHTML = sourceRegistry
    .map(
      (source) => `
        <article class="source-row">
          <div>
            <strong>${source.name}</strong>
            <small>${source.type} · trust ${source.trustScore}</small>
          </div>
          <span class="source-status ${source.status}">${source.status}</span>
          <small>ล่าสุด ${source.lastFetched}</small>
        </article>
      `,
    )
    .join("");
}

function updateRefreshStamp(mode = "manual") {
  const dateLine = document.querySelector(".date-line");
  if (!dateLine) return;

  const sourceCount = sourceRegistry.length;
  const newsCount = currentNewsItems.length;
  const rumorCount = currentRumors.length;
  const languageLabel = languageMode === "original" ? "ต้นฉบับ" : "ภาษาไทย";
  dateLine.textContent = `${mode === "auto" ? "Auto refresh" : "รีเฟรช"} ล่าสุดเมื่อ ${new Date().toLocaleTimeString("th-TH")} · แสดงผล ${languageLabel} · โหลดข่าว ${newsCount} รายการ, ข่าวลือ ${rumorCount} รายการ จาก ${sourceCount} sources`;
}

if (leagueFilter) {
  leagueFilter.addEventListener("change", (event) => {
    currentNewsPage = 1;
    renderNews(event.target.value);
  });
}

document.querySelectorAll("[data-filter-link]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    if (!leagueFilter) return;
    leagueFilter.value = link.dataset.filterLink;
    currentNewsPage = 1;
    renderNews(link.dataset.filterLink);
    document.querySelectorAll("[data-filter-link]").forEach((item) => item.classList.toggle("active", item === link));
  });
});

if (newsPagination) {
  newsPagination.addEventListener("click", (event) => {
    const link = event.target.closest("[data-news-page]");
    if (!link) return;
    event.preventDefault();
    currentNewsPage = Number(link.dataset.newsPage) || 1;
    renderNews(leagueFilter?.value ?? "All");
    newsList.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

const teamDetailTabs = document.querySelector("#teamDetailTabs");
if (teamDetailTabs) {
  teamDetailTabs.addEventListener("click", (event) => {
    const link = event.target.closest("[data-team-tab]");
    if (!link) return;
    event.preventDefault();
    const targetId = link.dataset.teamTab;
    teamDetailTabs.querySelectorAll("[data-team-tab]").forEach((tab) => {
      tab.classList.toggle("active", tab === link);
    });
    document.querySelectorAll(".team-tab-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.id === targetId);
    });
  });
}

if (rumorPagination) {
  rumorPagination.addEventListener("click", (event) => {
    const link = event.target.closest("[data-rumor-page]");
    if (!link) return;
    event.preventDefault();
    currentRumorPage = Number(link.dataset.rumorPage) || 1;
    renderRumors();
    rumorGrid.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

const refreshNews = document.querySelector("#refreshNews");
if (refreshNews) {
  refreshNews.addEventListener("click", () => {
    loadLiveData("manual");
  });
}

if (autoRefreshSelect) {
  autoRefreshSelect.addEventListener("change", (event) => {
    if (autoRefreshTimer) {
      window.clearInterval(autoRefreshTimer);
      autoRefreshTimer = null;
    }

    const seconds = Number(event.target.value);
    if (!seconds) {
      updateRefreshStamp("manual");
      return;
    }

    autoRefreshTimer = window.setInterval(() => {
      renderNews(leagueFilter?.value ?? "All");
      updateRefreshStamp("auto");
    }, seconds * 1000);

    updateRefreshStamp("manual");
  });
}

const search = document.querySelector(".search");
if (search) {
  search.addEventListener("submit", (event) => {
    event.preventDefault();
    const term = event.currentTarget.querySelector("input").value.trim().toLowerCase();
    if (!term) {
      renderNews(leagueFilter.value);
      return;
    }

    const result = currentNewsItems.filter((item) => {
      return `${item.title} ${item.summary} ${item.league}`.toLowerCase().includes(term);
    });

    newsList.innerHTML = result.length
      ? result
          .map(
            (item) => `
              <article class="news-item">
                <time class="news-time">${item.time}</time>
                <div>
                  <h3><a href="article-detail.html">${item.title}</a></h3>
                  <p>${item.summary}</p>
                  <span class="credit">${item.source} · Source: <a href="${item.originalUrl}" target="_blank" rel="noopener">${item.sourceName}</a> (${item.sourceType})</span>
                </div>
                <span class="news-badge ${item.hot ? "hot" : ""}">${item.badge}</span>
              </article>
            `,
          )
          .join("")
      : `<article class="news-item"><span class="news-time">-</span><div><h3>ไม่พบข่าวที่ค้นหา</h3><p>ลองค้นหาด้วยชื่อทีม ลีก หรือนักเตะอีกครั้ง</p></div></article>`;
  });
}

async function loadLiveData(mode = "manual") {
  try {
    const [liveNews, liveRumors, liveStandings, liveFixtures, liveMonomaxBroadcasts, liveResults, liveTeams, livePlayers, liveLeagues] = await Promise.all([
      api.getNews(),
      api.getRumors(),
      api.getStandings(),
      api.getFixtures(),
      api.getMonomaxBroadcasts(),
      api.getResults(),
      api.getTeams(),
      api.getPlayers(),
      api.getLeagues(),
    ]);
    currentNewsItems = liveNews.length ? liveNews : newsItems;
    currentRumors = liveRumors.length ? liveRumors : rumors;
    currentFixtureItems = liveFixtures;
    renderStandings(liveStandings);
    renderMatchList(fixtureList, liveFixtures);
    renderMonomaxBroadcasts(liveMonomaxBroadcasts);
    renderMatchList(resultsList, liveResults);
    renderTeams(liveTeams);
    renderTeamDetail(liveTeams, liveFixtures);
    renderPlayers(livePlayers);
    renderLeagues(liveLeagues);
    renderLeagueDetail(liveStandings, liveLeagues);
  } catch (error) {
    console.warn(`Using local mock data: ${error.message}`);
    currentNewsItems = newsItems;
    currentRumors = rumors;
    currentFixtureItems = [];
    renderStandings();
    renderMatchList(fixtureList);
    renderMonomaxBroadcasts([]);
    renderMatchList(resultsList);
    renderTeams();
    renderTeamDetail([], []);
    renderPlayers([]);
    renderLeagues([]);
    renderLeagueDetail();
  }

  renderNews(leagueFilter?.value ?? "All");
  renderHotNews(currentNewsItems);
  renderRumors();
  updateRefreshStamp(mode);
}

window.addEventListener("befootball:language-change", (event) => {
  languageMode = event.detail?.language ?? "th";
  loadLiveData("manual");
});

renderNews();
renderHotNews();
renderRumors();
renderStandings();
renderMatchList(fixtureList);
renderMonomaxBroadcasts();
renderMatchList(resultsList);
renderTeams();
renderTeamDetail();
renderPlayers();
renderLeagues();
renderLeagueDetail();
loadLiveData();
