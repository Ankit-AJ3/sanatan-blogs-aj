import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { PostGrid } from "@/components/PostCard";
import { getDictionary, isLocale, localePath } from "@/lib/i18n";
import { alternatesFor, getT } from "@/lib/locale";
import { getPublishedPosts } from "@/lib/posts";

export async function generateMetadata({ params, searchParams }: PageProps<"/[lang]/blog">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  const { q, page } = await searchParams;
  const pageNum = Number(page) || 1;
  const path = pageNum > 1 ? `/blog?page=${pageNum}` : "/blog";
  return {
    title: pageNum > 1 ? t.blog.metaPage(pageNum) : t.blog.metaTitle,
    description: t.blog.metaDescription,
    alternates: alternatesFor(lang, path),
    // Search result pages shouldn't be indexed
    robots: q ? { index: false, follow: true } : undefined,
  };
}

export default async function BlogPage({ searchParams }: PageProps<"/[lang]/blog">) {
  const { lang, t } = await getT();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 100) : "";
  const page = Math.max(1, Number(sp.page) || 1);
  const { posts, total, totalPages } = await getPublishedPosts({ page, query: q || undefined });

  return (
    <>
      <PageHeader title={t.blog.title} description={t.blog.description} crumbs={[{ name: t.blog.title, href: "/blog" }]} />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <form
          id="search"
          role="search"
          action={localePath(lang, "/blog")}
          className="mb-8 flex max-w-xl items-center gap-2 rounded-full border border-line bg-surface p-1.5"
        >
          <label htmlFor="q" className="sr-only">
            {t.nav.search}
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder={t.blog.searchPlaceholder}
            className="min-w-0 flex-1 bg-transparent px-4 py-2 outline-none placeholder:text-muted/70"
          />
          <button className="rounded-full bg-saffron px-5 py-2 font-semibold text-white hover:brightness-110">
            {t.hero.searchButton}
          </button>
        </form>
        {q && (
          <p className="mb-6 text-muted">
            “<span className="font-semibold text-ink">{q}</span>” {t.blog.results(total)}
          </p>
        )}
        <PostGrid posts={posts} />
        <Pagination page={page} totalPages={totalPages} basePath={localePath(lang, "/blog")} query={q} />
      </div>
    </>
  );
}
