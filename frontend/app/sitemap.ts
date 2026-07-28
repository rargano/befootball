import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://befootball.example";

  return [
    "",
    "/news",
    "/rumors",
    "/fixtures",
    "/results",
    "/standings",
    "/team/arsenal",
    "/player/bukayo-saka",
    "/league/premier-league",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
  }));
}
