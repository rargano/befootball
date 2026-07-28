import { spawn } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import { get } from "node:http";
import { resolve } from "node:path";

const port = 43173;
const baseUrl = `http://127.0.0.1:${port}`;
const viewDirectory = resolve("src/views");
const server = spawn(process.execPath, ["server.js"], {
  env: { ...process.env, PORT: String(port) },
  stdio: ["ignore", "pipe", "pipe"],
});

const failures = [];

async function request(pathname, options = {}) {
  return new Promise((resolvePromise, rejectPromise) => {
    const requestHandle = get(`${baseUrl}${pathname}`, (response) => {
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume();
        request(response.headers.location, options).then(resolvePromise, rejectPromise);
        return;
      }

      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () => {
        if (!response.statusCode || response.statusCode < 200 || response.statusCode >= 300) {
          rejectPromise(new Error(`${response.statusCode ?? "unknown"} ${pathname}`));
          return;
        }
        resolvePromise({
          json: async () => JSON.parse(body),
          text: async () => body,
        });
      });
    });

    requestHandle.setTimeout(options.timeout ?? 45000, () => {
      requestHandle.destroy(new Error(`timeout ${pathname}`));
    });
    requestHandle.on("error", rejectPromise);
  });
}

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      await request("/", { timeout: 1000 });
      return;
    } catch {
      await new Promise((resolvePromise) => setTimeout(resolvePromise, 100));
    }
  }
  throw new Error("Server did not start");
}

async function check(name, callback) {
  try {
    await callback();
    console.log(`PASS ${name}`);
  } catch (error) {
    failures.push(`${name}: ${error.message}`);
    console.error(`FAIL ${name}: ${error.message}`);
  }
}

try {
  await waitForServer();

  const pages = (await readdir(viewDirectory))
    .filter((file) => file.endsWith(".html"))
    .sort();

  for (const page of pages) {
    await check(`page ${page}`, async () => {
      const response = await request(`/src/views/${page}`);
      const html = await response.text();
      if (!html.includes("<html") || !html.includes("</html>")) {
        throw new Error("incomplete HTML document");
      }
    });
  }

  const apiPaths = [
    "/api/news?lang=original",
    "/api/rumors",
    "/api/standings/epl",
    "/api/fixtures/epl",
    "/api/results/epl",
    "/api/teams/epl",
    "/api/players/featured",
    "/api/leagues",
    "/api/broadcasts/monomax",
  ];

  for (const apiPath of apiPaths) {
    await check(`API ${apiPath}`, async () => {
      const response = await request(apiPath);
      const payload = await response.json();
      if (payload.status !== "success" || !Array.isArray(payload.data)) {
        throw new Error("invalid API envelope");
      }
    });
  }

  await check("all enabled RSS sources return items", async () => {
    const config = JSON.parse(await readFile(resolve("config/sources/sources.json"), "utf8"));
    const expectedSources = config.sources
      .filter((source) => source.type === "rss" && source.enabled && source.allow_fetch && source.allow_display)
      .map((source) => source.name);
    const newsResponse = await request("/api/news?lang=original");
    const newsPayload = await newsResponse.json();
    const returnedSources = new Set(newsPayload.data.map((item) => item.source_name));
    const missingSources = expectedSources.filter((source) => !returnedSources.has(source));
    if (missingSources.length) {
      throw new Error(`missing sources: ${missingSources.join(", ")}`);
    }
  });

  await check("team roster API", async () => {
    const teamsResponse = await request("/api/teams/epl");
    const teamsPayload = await teamsResponse.json();
    const teamId = teamsPayload.data.find((team) => team.team_id)?.team_id;
    if (!teamId) throw new Error("no team id available");
    const rosterResponse = await request(`/api/teams/${teamId}/players`);
    const rosterPayload = await rosterResponse.json();
    if (rosterPayload.status !== "success" || !Array.isArray(rosterPayload.data)) {
      throw new Error("invalid roster response");
    }
  });

  await check("local HTML references", async () => {
    for (const page of pages) {
      const html = await readFile(resolve(viewDirectory, page), "utf8");
      const references = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
      for (const reference of references) {
        if (/^(?:https?:|#|data:)/.test(reference)) continue;
        const target = new URL(reference, `${baseUrl}/src/views/${page}`);
        await request(`${target.pathname}${target.search}`);
      }
    }
  });
} finally {
  server.kill("SIGTERM");
}

if (failures.length) {
  console.error(`\n${failures.length} smoke test(s) failed.`);
  process.exitCode = 1;
} else {
  console.log("\nAll smoke tests passed.");
}
