import type { APIContext } from "astro";
import { siteConfig } from "../config";
import { getPosts } from "../lib/posts";
import { url } from "../lib/url";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function GET(context: APIContext) {
  const posts = await getPosts({ includeDrafts: false });
  const site = context.site ?? new URL("http://localhost:4321");
  const home = new URL(import.meta.env.BASE_URL, site);

  const items = posts
    .map((post) => {
      const link = new URL(url(`/blog/${post.id}/`), site).href;
      const categories = [post.data.category, ...post.data.tags.map((tag) => tag.name)]
        .map((category) => `<category>${escapeXml(category)}</category>`)
        .join("");
      return `<item>
        <title>${escapeXml(post.data.title)}</title>
        <link>${escapeXml(link)}</link>
        <guid>${escapeXml(link)}</guid>
        <pubDate>${new Date(`${post.data.date}T00:00:00.000Z`).toUTCString()}</pubDate>
        <description>${escapeXml(post.data.description)}</description>
        ${categories}
      </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <description>${escapeXml(siteConfig.description)}</description>
    <link>${escapeXml(home.href)}</link>
    <language>ko-kr</language>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
