import type { ApiResponse, Article, Rumor } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`API request failed with ${response.status}`);
  }

  const json = (await response.json()) as ApiResponse<T>;

  if (json.status !== "success" || json.data === null) {
    throw new Error(json.error_msg ?? "API request failed");
  }

  return json.data;
}

async function requestWithFallback<T>(livePath: string, fallbackPath: string): Promise<T> {
  try {
    return await request<T>(livePath);
  } catch {
    return request<T>(fallbackPath);
  }
}

export function getNews() {
  return requestWithFallback<Article[]>("/news", "/news.json");
}

export function getRumors() {
  return requestWithFallback<Rumor[]>("/rumors", "/rumors.json");
}
