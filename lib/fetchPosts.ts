import Parser from "rss-parser";
import { BUTTONDOWN_RSS } from "./config";
import { normalizeTags } from "./tagging";

export type Post = {
  id: string;
  title: string;
  url: string;
  dateISO: string;
  tags: string[];
  summary: string;
};

const parser = new Parser({
  customFields: { item: [["category","categories"]] }
});

export async function fetchPosts(): Promise<Post[]> {
  const feed = await parser.parseURL(BUTTONDOWN_RSS);
  const items = feed.items || [];

  const posts: Post[] = items.map((item, i) => ({
    id: item.guid || item.link || String(i),
    title: item.title || "Untitled",
    url: item.link || "#",
    dateISO: (item as any).isoDate || item.pubDate || new Date().toISOString(),
    tags: normalizeTags((item as any).categories || []),
    summary: item.contentSnippet || stripHtml(item.content || "").slice(0, 180),
  }));

  return posts;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
