import Link from "next/link";
import type { PostCardData } from "@/lib/posts";
import { getCategory } from "@/lib/site";
import { formatDate } from "@/lib/utils";
import { CoverArt } from "./CoverArt";

export function PostCard({ post, priority = false }: { post: PostCardData; priority?: boolean }) {
  const cat = getCategory(post.category);
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-sm transition duration-300 hover:-translate-y-1 hover:border-saffron/40 hover:shadow-xl hover:shadow-saffron/10">
      <CoverArt
        title={post.title}
        coverImage={post.coverImage}
        category={post.category}
        priority={priority}
        className="aspect-[16/9]"
      />
      <div className="flex flex-1 flex-col p-5">
        {cat && (
          <Link
            href={`/category/${cat.slug}`}
            className="relative z-10 mb-3 w-fit rounded-full bg-saffron-soft px-3 py-1 text-xs font-semibold text-saffron hover:brightness-95"
          >
            {cat.nameHi}
          </Link>
        )}
        <h3 className="font-serif text-xl font-bold leading-snug text-ink line-clamp-2 group-hover:text-saffron">
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-muted line-clamp-3">{post.excerpt}</p>
        <div className="mt-4 flex items-center justify-between border-t border-line pt-4 text-sm text-muted">
          <span>
            <time dateTime={post.publishedAt?.toISOString()}>{formatDate(post.publishedAt)}</time> ·{" "}
            {post.readingTime} मिनट
          </span>
          <span className="flex items-center gap-3">
            <span aria-label={`${post.likeCount} likes`}>🙏 {post.likeCount}</span>
            <span aria-label={`${post.commentCount} comments`}>💬 {post.commentCount}</span>
          </span>
        </div>
      </div>
    </article>
  );
}

export function PostGrid({ posts }: { posts: PostCardData[] }) {
  if (!posts.length) {
    return (
      <div className="rounded-3xl border border-dashed border-line p-12 text-center text-muted">
        <p className="text-4xl">🪔</p>
        <p className="mt-3">अभी यहाँ कोई लेख नहीं है। जल्द ही नए लेख आएँगे!</p>
      </div>
    );
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((p, i) => (
        <PostCard key={p.id} post={p} priority={i < 3} />
      ))}
    </div>
  );
}
