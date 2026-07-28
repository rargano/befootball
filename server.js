import { createServer } from "node:http";
import { get as httpsGet } from "node:https";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const PORT = Number(process.env.PORT ?? 4173);
const ROOT = process.cwd();
const NEWS_CACHE_MS = 5 * 60 * 1000;
const NEWS_ITEMS_PER_SOURCE = 20;
const STANDINGS_CACHE_MS = 10 * 60 * 1000;
const SCOREBOARD_CACHE_MS = 10 * 60 * 1000;
const BROADCAST_CACHE_MS = 30 * 60 * 1000;

let newsCache = null;
let newsCacheAt = 0;
let standingsCache = null;
let standingsCacheAt = 0;
const scoreboardCache = new Map();
const translationCache = new Map();
const broadcastCache = new Map();

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function loadEnvFile() {
  try {
    const contents = readFileSync(join(ROOT, ".env"), "utf8");
    contents.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) return;
      const [key, ...valueParts] = trimmed.split("=");
      if (process.env[key]) return;
      process.env[key] = valueParts.join("=").replace(/^["']|["']$/g, "");
    });
  } catch {
    // .env is optional for the static JS server.
  }
}

loadEnvFile();

function responseJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

function success(data) {
  return {
    status: "success",
    data,
    pagination: { page: 1, page_size: data.length, total: data.length },
    error_msg: null,
  };
}

function textBetween(value, tag) {
  const match = value.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return cleanText(match?.[1] ?? "");
}

function firstTextBetween(value, tags) {
  return tags.map((tag) => textBetween(value, tag)).find(Boolean) ?? "";
}

function cleanText(value) {
  const cleaned = value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

  return /^(null|undefined|n\/a)$/i.test(cleaned) ? "" : cleaned;
}

function slugify(value) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `article-${Date.now()}`;
}

function categoryFromTitle(title) {
  const value = title.toLowerCase();
  if (/(transfer|sign|loan|bid|deal)/.test(value)) return "transfer";
  if (/(injury|fitness|return)/.test(value)) return "fitness";
  if (/(fixture|result|win|draw|beat)/.test(value)) return "match";
  return "news";
}

function statValue(stats, name) {
  return stats.find((stat) => stat.name === name || stat.type === name)?.displayValue ?? "0";
}

function yyyymmdd(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

async function readJson(path) {
  return JSON.parse(await readFile(join(ROOT, path), "utf8"));
}

function fetchText(url, options = {}) {
  return new Promise((resolve, reject) => {
    const headers = { "User-Agent": "beFootball/1.0 static-js-reader" };
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    const request = httpsGet(
      url,
      {
        headers,
        timeout: 8000,
      },
      (response) => {
        if (!response.statusCode || response.statusCode < 200 || response.statusCode >= 300) {
          response.resume();
          reject(new Error(`RSS returned ${response.statusCode ?? "unknown status"}`));
          return;
        }

        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => resolve(body));
      },
    );

    request.on("timeout", () => {
      request.destroy(new Error("RSS request timed out"));
    });
    request.on("error", reject);
  });
}

async function translateText(text, targetLang = "th") {
  if (!text || targetLang === "original") {
    return text;
  }

  const cacheKey = `${targetLang}:${text}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  const params = new URLSearchParams({
    client: "gtx",
    sl: "auto",
    tl: targetLang,
    dt: "t",
    q: text,
  });
  const url = `https://translate.googleapis.com/translate_a/single?${params.toString()}`;

  try {
    const response = JSON.parse(await fetchText(url));
    const translated = Array.isArray(response?.[0])
      ? response[0].map((part) => part?.[0] ?? "").join("")
      : text;
    translationCache.set(cacheKey, translated || text);
    return translated || text;
  } catch (error) {
    console.warn(`Translation failed: ${error.message}`);
    translationCache.set(cacheKey, text);
    return text;
  }
}

async function mapWithConcurrency(items, limit, mapper) {
  const results = [];
  for (let index = 0; index < items.length; index += limit) {
    const chunk = items.slice(index, index + limit);
    results.push(...(await Promise.all(chunk.map(mapper))));
  }

  return results;
}

async function localizeNews(items, lang) {
  if (lang === "original") {
    return items.map((item) => ({
      ...item,
      title_th: item.title_original,
      summary_th: item.summary_original,
      display_language: "original",
    }));
  }

  return mapWithConcurrency(items, 5, async (item) => ({
    ...item,
    title_th: await translateText(item.title_original, "th"),
    summary_th: await translateText(item.summary_original, "th"),
    display_language: "th",
  }));
}

async function fetchEplStandings() {
  if (standingsCache && Date.now() - standingsCacheAt < STANDINGS_CACHE_MS) {
    return standingsCache;
  }

  const url = "https://site.web.api.espn.com/apis/v2/sports/soccer/eng.1/standings?region=us&lang=en";
  const json = JSON.parse(await fetchText(url));
  const entries = json.children?.[0]?.standings?.entries;

  if (!Array.isArray(entries)) {
    throw new Error("Invalid standings response");
  }

  standingsCache = entries.map((entry, index) => {
    const stats = Array.isArray(entry.stats) ? entry.stats : [];
    return {
      rank: index + 1,
      team_id: entry.team?.id ?? null,
      team: entry.team?.shortDisplayName ?? entry.team?.displayName ?? "Unknown",
      team_full: entry.team?.displayName ?? entry.team?.shortDisplayName ?? "Unknown",
      logo: entry.team?.logos?.[0]?.href ?? null,
      played: statValue(stats, "gamesPlayed"),
      won: statValue(stats, "wins"),
      drawn: statValue(stats, "ties"),
      lost: statValue(stats, "losses"),
      goal_difference: statValue(stats, "pointDifferential"),
      points: statValue(stats, "points"),
      note: entry.note?.description ?? null,
    };
  });
  standingsCacheAt = Date.now();
  return standingsCache;
}

async function fetchEplScoreboard(kind) {
  const now = new Date();
  const dateRange = kind === "results"
    ? `${yyyymmdd(addDays(now, -45))}-${yyyymmdd(now)}`
    : `${yyyymmdd(now)}-${yyyymmdd(addDays(now, 60))}`;
  const cacheKey = `${kind}:${dateRange}`;
  const cached = scoreboardCache.get(cacheKey);
  if (cached && Date.now() - cached.at < SCOREBOARD_CACHE_MS) {
    return cached.data;
  }

  const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard?dates=${dateRange}`;
  const json = JSON.parse(await fetchText(url));
  const events = Array.isArray(json.events) ? json.events : [];
  const mapped = events.map((event) => {
    const competition = event.competitions?.[0] ?? {};
    const competitors = competition.competitors ?? [];
    const home = competitors.find((team) => team.homeAway === "home") ?? competitors[0] ?? {};
    const away = competitors.find((team) => team.homeAway === "away") ?? competitors[1] ?? {};
    const kickoff = event.date ? new Date(event.date) : null;
    const statusType = competition.status?.type ?? event.status?.type ?? {};
    const isCompleted = statusType.completed === true || statusType.name === "STATUS_FINAL";
    const isLive = statusType.state === "in";

    return {
      id: event.id,
      league: json.leagues?.[0]?.abbreviation ?? "Premier League",
      home_team: home.team?.shortDisplayName ?? home.team?.displayName ?? "TBD",
      away_team: away.team?.shortDisplayName ?? away.team?.displayName ?? "TBD",
      home_score: home.score ?? "",
      away_score: away.score ?? "",
      kickoff_at: event.date ?? null,
      time: kickoff && !Number.isNaN(kickoff.getTime())
        ? kickoff.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })
        : "--:--",
      date_label: kickoff && !Number.isNaN(kickoff.getTime())
        ? kickoff.toLocaleDateString("th-TH", { day: "numeric", month: "short" })
        : "",
      status: isCompleted ? "จบการแข่งขัน" : isLive ? "กำลังแข่งขัน" : (statusType.shortDetail ?? "โปรแกรมล่วงหน้า"),
      completed: isCompleted,
      live: isLive,
    };
  });

  const data = mapped
    .filter((event) => kind === "results" ? event.completed : !event.completed)
    .slice(kind === "results" ? -20 : 0, kind === "results" ? undefined : 20)
    .reverse();
  scoreboardCache.set(cacheKey, { at: Date.now(), data });
  return data;
}

async function fetchEplTeams() {
  const standings = await fetchEplStandings();
  return standings.map((row) => ({
    team_id: row.team_id,
    rank: row.rank,
    name: row.team,
    full_name: row.team_full,
    logo: row.logo,
    league: "Premier League",
    played: row.played,
    points: row.points,
  }));
}

async function fetchTeamPlayers(teamId) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/teams/${teamId}/roster`;
  const json = JSON.parse(await fetchText(url));
  const athletes = Array.isArray(json.athletes) ? json.athletes : [];

  return athletes.slice(0, 8).map((athlete) => ({
    id: athlete.id,
    name: athlete.displayName ?? athlete.fullName ?? "Unknown player",
    team: json.team?.shortDisplayName ?? json.team?.displayName ?? "",
    position: athlete.position?.abbreviation ?? athlete.position?.displayName ?? "",
    jersey: athlete.jersey ?? "",
    profile_url: "player-detail.html",
  }));
}

function featuredPlayers() {
  return [
    { name: "Bukayo Saka", team: "Arsenal", position: "RW", profile_url: "player-detail.html" },
    { name: "Erling Haaland", team: "Man City", position: "ST", profile_url: "player-detail.html" },
    { name: "Mohamed Salah", team: "Liverpool", position: "RW", profile_url: "player-detail.html" },
    { name: "Cole Palmer", team: "Chelsea", position: "AM", profile_url: "player-detail.html" },
    { name: "Bruno Fernandes", team: "Man United", position: "AM", profile_url: "player-detail.html" },
    { name: "Declan Rice", team: "Arsenal", position: "CM", profile_url: "player-detail.html" },
  ];
}

function supportedLeagues() {
  return [
    { code: "eng.1", name: "Premier League", country: "England", status: "live", source: "ESPN public standings / scoreboard" },
    { code: "esp.1", name: "LaLiga", country: "Spain", status: "planned", source: "เตรียมต่อ endpoint" },
    { code: "ita.1", name: "Serie A", country: "Italy", status: "planned", source: "เตรียมต่อ endpoint" },
    { code: "ger.1", name: "Bundesliga", country: "Germany", status: "planned", source: "เตรียมต่อ endpoint" },
  ];
}

async function fetchRssNews() {
  if (newsCache && Date.now() - newsCacheAt < NEWS_CACHE_MS) {
    return newsCache;
  }

  const config = await readJson("config/sources/sources.json");
  const rssSources = config.sources.filter((source) => {
    return source.enabled && source.allow_fetch && source.allow_display && source.type === "rss";
  });

  const results = [];
  const seen = new Set();
  for (const source of rssSources) {
    if (!source.feed_url) continue;

    try {
      const xml = await fetchText(source.feed_url);
      const items = xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? [];

      items.slice(0, NEWS_ITEMS_PER_SOURCE).forEach((item) => {
        const title = textBetween(item, "title");
        const originalUrl = firstTextBetween(item, ["link", "guid"]);
        const dedupeKey = (originalUrl || title).toLowerCase();
        if (!title || !originalUrl || seen.has(dedupeKey)) return;
        seen.add(dedupeKey);

        const publishedAt = new Date(firstTextBetween(item, ["pubDate", "dc:date", "updated"]));
        const summary = firstTextBetween(item, ["description", "content:encoded"])
          || "อ่านรายละเอียดข่าวฉบับเต็มได้จากแหล่งข่าวต้นฉบับ";
        results.push({
          id: results.length + 1,
          slug: slugify(title),
          title_th: title,
          summary_th: summary,
          title_original: title,
          summary_original: summary,
          category: categoryFromTitle(title),
          source_credit_text: `สรุปหัวข้อข่าวจาก ${source.name}`,
          source_name: source.name,
          source_type: "RSS",
          original_url: originalUrl,
          published_at: Number.isNaN(publishedAt.getTime()) ? new Date().toISOString() : publishedAt.toISOString(),
        });
      });
    } catch (error) {
      console.warn(`${source.name} RSS fetch failed: ${error.message}`);
    }
  }

  results.sort((a, b) => b.published_at.localeCompare(a.published_at));
  newsCache = results.map((item, index) => ({ ...item, id: index + 1 }));
  newsCacheAt = Date.now();
  return newsCache;
}

async function fetchMonomaxBroadcasts() {
  const cacheKey = "monomax-football-program";
  const cached = broadcastCache.get(cacheKey);
  if (cached && Date.now() - cached.at < BROADCAST_CACHE_MS) {
    return cached.data;
  }

  const config = await readJson("config/sources/sources.json");
  const source = config.sources.find((item) => item.id === cacheKey);
  if (!source?.enabled || !source.allow_fetch || !source.allow_display || !source.page_url) {
    return [];
  }

  const html = await fetchText(source.page_url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; beFootball/1.0; +https://befootball.local)",
      "Accept-Language": "th,en;q=0.9",
    },
  });
  const articleHtml = html.match(/<article\b[\s\S]*?<\/article>/i)?.[0] ?? html;
  const images = [];
  const seen = new Set();
  const imagePattern = /(?:data-src|src)="(https:\/\/img\.monomax\.me\/[^"]+\/monomax-obj\.obs\.ap-southeast-2\.myhuaweicloud\.com\/assets\/contents\/[^"]+\.(?:jpg|jpeg|png|webp))"/gi;
  let match;

  while ((match = imagePattern.exec(articleHtml))) {
    const imageUrl = match[1].replace(/&amp;/g, "&");
    if (seen.has(imageUrl)) continue;
    seen.add(imageUrl);
    images.push({
      id: `monomax-${images.length + 1}`,
      title: `ตารางถ่ายทอดสดฟุตบอล Monomax ชุดที่ ${images.length + 1}`,
      image_url: imageUrl,
      source_name: source.name,
      source_type: "schedule_page",
      source_url: source.page_url,
      source_credit_text: `ตารางจาก ${source.name}`,
    });
  }

  const data = images.slice(0, 8);
  broadcastCache.set(cacheKey, { at: Date.now(), data });
  return data;
}

async function handleApi(req, res, url) {
  const pathname = url.pathname;
  const lang = url.searchParams.get("lang") === "original" ? "original" : "th";

  if (pathname === "/api/news") {
    try {
      const liveNews = await fetchRssNews();
      if (liveNews.length > 0) {
        responseJson(res, 200, success(await localizeNews(liveNews, lang)));
        return;
      }
    } catch (error) {
      console.warn(`Live news fetch failed: ${error.message}`);
    }

    responseJson(res, 200, await readJson("public/api/news.json"));
    return;
  }

  if (pathname === "/api/rumors") {
    responseJson(res, 200, await readJson("public/api/rumors.json"));
    return;
  }

  if (pathname === "/api/standings/epl") {
    try {
      responseJson(res, 200, success(await fetchEplStandings()));
    } catch (error) {
      console.warn(`Standings fetch failed: ${error.message}`);
      const fallback = [
        { rank: 1, team: "Liverpool", played: "0", won: "0", drawn: "0", lost: "0", goal_difference: "0", points: "0" },
        { rank: 2, team: "Arsenal", played: "0", won: "0", drawn: "0", lost: "0", goal_difference: "0", points: "0" },
        { rank: 3, team: "Man City", played: "0", won: "0", drawn: "0", lost: "0", goal_difference: "0", points: "0" },
        { rank: 4, team: "Chelsea", played: "0", won: "0", drawn: "0", lost: "0", goal_difference: "0", points: "0" },
        { rank: 5, team: "Man United", played: "0", won: "0", drawn: "0", lost: "0", goal_difference: "0", points: "0" },
      ];
      responseJson(res, 200, success(fallback));
    }
    return;
  }

  if (pathname === "/api/fixtures/epl" || pathname === "/api/results/epl") {
    const kind = pathname.includes("results") ? "results" : "fixtures";
    try {
      responseJson(res, 200, success(await fetchEplScoreboard(kind)));
    } catch (error) {
      console.warn(`Scoreboard fetch failed: ${error.message}`);
      responseJson(res, 200, success([]));
    }
    return;
  }

  if (pathname === "/api/broadcasts/monomax") {
    try {
      responseJson(res, 200, success(await fetchMonomaxBroadcasts()));
    } catch (error) {
      console.warn(`Monomax broadcasts fetch failed: ${error.message}`);
      responseJson(res, 200, success([]));
    }
    return;
  }

  if (pathname === "/api/teams/epl") {
    try {
      responseJson(res, 200, success(await fetchEplTeams()));
    } catch (error) {
      console.warn(`Teams fetch failed: ${error.message}`);
      responseJson(res, 200, success([]));
    }
    return;
  }

  if (pathname === "/api/players/featured") {
    responseJson(res, 200, success(featuredPlayers()));
    return;
  }

  const teamPlayersMatch = pathname.match(/^\/api\/teams\/([^/]+)\/players$/);
  if (teamPlayersMatch) {
    try {
      responseJson(res, 200, success(await fetchTeamPlayers(teamPlayersMatch[1])));
    } catch (error) {
      console.warn(`Team players fetch failed: ${error.message}`);
      responseJson(res, 200, success([]));
    }
    return;
  }

  if (pathname === "/api/leagues") {
    responseJson(res, 200, success(supportedLeagues()));
    return;
  }

  responseJson(res, 404, {
    status: "fail",
    data: null,
    pagination: null,
    error_msg: "Endpoint not found",
  });
}

async function serveStatic(res, pathname) {
  if (pathname === "/") {
    res.writeHead(302, { Location: "/src/views/index.html" });
    res.end();
    return;
  }

  const aliases = [
    { from: /^\/controllers\//, to: "/src/controllers/" },
    { from: /^\/models\//, to: "/src/models/" },
    { from: /^\/assets\//, to: "/public/assets/" },
  ];
  const alias = aliases.find((item) => item.from.test(pathname));
  const target = alias ? pathname.replace(alias.from, alias.to) : pathname;
  const normalizedPath = normalize(decodeURIComponent(target)).replace(/^(\.\.[/\\])+/, "");
  let filePath = join(ROOT, normalizedPath);
  let body;

  try {
    body = await readFile(filePath);
  } catch (error) {
    if (extname(normalizedPath) !== ".html") {
      throw error;
    }

    filePath = join(ROOT, "src/views", normalizedPath.replace(/^[/\\]+/, ""));
    body = await readFile(filePath);
  }

  const contentType = mimeTypes[extname(filePath)] ?? "application/octet-stream";

  res.writeHead(200, { "Content-Type": contentType });
  res.end(body);
}

createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

  try {
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
      return;
    }

    await serveStatic(res, url.pathname);
  } catch (error) {
    responseJson(res, 404, {
      status: "fail",
      data: null,
      pagination: null,
      error_msg: "File not found",
    });
  }
}).listen(PORT, () => {
  console.log(`beFootball static JS server: http://localhost:${PORT}`);
});
