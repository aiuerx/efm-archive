import Head from "next/head";
import { useMemo, useState } from "react";
import type { GetStaticProps } from "next";
import { Calendar, Filter, Search, Tag, ExternalLink } from "lucide-react";
import { fetchPosts, type Post } from "@/lib/fetchPosts";
import { KNOWN_TAGS } from "@/lib/tagging";
import { REVALIDATE_SECONDS, SITE_TAGLINE, SITE_TITLE } from "@/lib/config";

type Props = { posts: Post[] };

export const getStaticProps: GetStaticProps<Props> = async () => {
  const posts = await fetchPosts();
  return { props: { posts }, revalidate: REVALIDATE_SECONDS };
};

export default function Home({ posts }: Props) {
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  // Fallbacks so you always see something even if config values are blank
  const title = SITE_TITLE || "Signal Notes — Archive";
  const tagline =
    SITE_TAGLINE || "Musings on synthesis, sound design, and electronic tools.";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = posts.filter((p) => {
      const hit =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.tags.join(" ").toLowerCase().includes(q);
      const tagOk =
        activeTags.length === 0 || activeTags.every((t) => p.tags.includes(t));
      return hit && tagOk;
    });
    out.sort((a, b) => {
      const da = new Date(a.dateISO).getTime();
      const db = new Date(b.dateISO).getTime();
      return sort === "newest" ? db - da : da - db;
    });
    return out;
  }, [posts, query, activeTags, sort]);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <Head>
  <title>Signal Notes — EFM</title>
  <meta name="description" content="Musings on synthesis, sound design, and electronic tools." />
  <meta property="og:title" content="Signal Notes — EFM" />
  <meta property="og:description" content="Musings on synthesis, sound design, and electronic tools." />
</Head>

      <header className="sticky top-0 z-10 backdrop-blur bg-neutral-50/80 border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Brand + Title */}
         <div className="flex items-center gap-3">
  <div>
    <h1 className="text-xl font-semibold leading-tight">{title}</h1>
    <p className="text-sm text-neutral-600">{tagline}</p>
  </div>
</div>


          {/* Right-side actions: Home + Subscribe */}
          <div className="flex items-center gap-2">
            <a
              href="https://efm.plus"
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-100"
            >
              Home
            </a>
            <a
              href="#subscribe"
              className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-100"
            >
              <ExternalLink className="h-4 w-4" />
              Subscribe
            </a>
          </div>
        </div>
      </header>

      {/* Controls */}
      <section className="max-w-5xl mx-auto px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Search */}
          <label className="relative block">
            <span className="sr-only">Search</span>
            <span className="absolute inset-y-0 left-3 flex items-center">
              <Search className="h-4 w-4 text-neutral-500" />
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, tags, summary"
              className="w-full rounded-xl border border-neutral-300 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-300"
            />
          </label>

          {/* Tags + Sort */}
          <div className="sm:col-span-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 text-sm text-neutral-600">
              <Filter className="h-4 w-4" />
              Filter
            </span>
            {KNOWN_TAGS.map((t) => {
              const on = activeTags.includes(t);
              return (
                <button
                  key={t}
                  onClick={() =>
                    setActiveTags((prev) =>
                      on ? prev.filter((x) => x !== t) : [...prev, t]
                    )
                  }
                  className={
                    "text-xs rounded-full border px-3 py-1 transition " +
                    (on
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-300 bg-white hover:bg-neutral-100")
                  }
                >
                  {t}
                </button>
              );
            })}
            <button
              onClick={() => setActiveTags([])}
              className="ml-auto text-xs text-neutral-600 underline underline-offset-4 hover:text-neutral-900"
            >
              Clear
            </button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="ml-2 text-xs rounded-lg border border-neutral-300 bg-white px-2 py-1"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>
      </section>

      {/* List */}
      <main className="max-w-5xl mx-auto px-4 pb-12">
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((p) => (
            <li
              key={p.id}
              className="group rounded-2xl border border-neutral-200 bg-white p-4 hover:shadow-sm transition"
            >
              <a href={p.url} className="block">
                <h2 className="text-base font-semibold leading-snug group-hover:underline underline-offset-4">
                  {p.title}
                </h2>
                <div className="mt-2 flex items-center gap-3 text-xs text-neutral-600">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(p.dateISO).toLocaleDateString()}
                  </span>
                  <span aria-hidden className="text-neutral-300">•</span>
                  <span className="inline-flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {p.tags.join(", ") || "untagged"}
                  </span>
                </div>
                <p className="mt-3 text-sm text-neutral-700 line-clamp-3">
                  {p.summary}
                </p>
              </a>
            </li>
          ))}
        </ul>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="mt-16 text-center text-sm text-neutral-600">
            No posts match your search/filters.
          </div>
        )}

        {/* Subscribe block */}
        <div
          id="subscribe"
          className="scroll-mt-24 mt-12 rounded-2xl border border-neutral-200 bg-white p-6"
        >
          <h3 className="text-base font-semibold">Subscribe to EFM</h3>
          <p className="mt-1 text-sm text-neutral-600">
            One email. Practical techniques, routing tips, occasional downloads.
          </p>
          <form
            action="https://buttondown.email/api/emails/embed-subscribe/efm" // replace with your handle
            method="post"
            target="popupwindow"
            className="mt-3 flex gap-2"
          >
            <input
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              className="flex-1 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-300"
            />
            <button
              type="submit"
              className="rounded-xl bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800"
            >
              Subscribe
            </button>
          </form>
          <p className="mt-2 text-xs text-neutral-500">
            We send rarely. No comments, no spam.
          </p>
        </div>
      </main>

      <footer className="border-t border-neutral-200 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-4 py-6 text-xs text-neutral-600">
          © {new Date().getFullYear()} EFM.
        </div>
      </footer>
    </div>
  );
}
