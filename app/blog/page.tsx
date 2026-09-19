import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { PostGrid } from "@/components/PostCard";
import { getPublishedPosts } from "@/lib/posts";

export async function generateMetadata({ searchParams }: PageProps<"/blog">): Promise<Metadata> {
  const { q, page } = await searchParams;
  const pageNum = Number(page) || 1;
  return {
    title: pageNum > 1 ? `सभी लेख — पृष्ठ ${pageNum}` : "सभी लेख — Sanatan Dharma Articles",
    description:
      "सनातन धर्म, भगवद् गीता, वेद-उपनिषद, पुराण, त्योहार, मंदिर और योग पर सभी लेख पढ़ें। Read all articles on Hindu spirituality and Indian culture.",
    alternates: { canonical: pageNum > 1 ? `/blog?page=${pageNum}` : "/blog" },
    // Search result pages shouldn't be indexed
    robots: q ? { index: false, follow: true } : undefined,
  };
}

export default async function BlogPage({ searchParams }: PageProps<"/blog">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 100) : "";
  const page = Math.max(1, Number(sp.page) || 1);
  const { posts, total, totalPages } = await getPublishedPosts({ page, query: q || undefined });

  return (
    <>
      <PageHeader
        title="सभी लेख"
        description="सनातन ज्ञान के विभिन्न विषयों पर हमारे सभी लेख।"
        crumbs={[{ name: "सभी लेख", href: "/blog" }]}
      />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <form id="search" role="search" className="mb-8 flex max-w-xl items-center gap-2 rounded-full border border-line bg-surface p-1.5">
          <label htmlFor="q" className="sr-only">
            लेख खोजें
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="शीर्षक या टैग से खोजें…"
            className="min-w-0 flex-1 bg-transparent px-4 py-2 outline-none placeholder:text-muted/70"
          />
          <button className="rounded-full bg-saffron px-5 py-2 font-semibold text-white hover:brightness-110">खोजें</button>
        </form>
        {q && (
          <p className="mb-6 text-muted">
            “<span className="font-semibold text-ink">{q}</span>” के लिए {total} परिणाम
          </p>
        )}
        <PostGrid posts={posts} />
        <Pagination page={page} totalPages={totalPages} basePath="/blog" query={q} />
      </div>
    </>
  );
}
