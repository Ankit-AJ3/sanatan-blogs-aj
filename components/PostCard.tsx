import Link from "next/link";
import { getDictionary, localePath, localizePost, type Locale } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import type { PostCardData } from "@/lib/posts";
import { categoryText, getCategory } from "@/lib/site";
import { formatDate } from "@/lib/utils";
import { CoverArt } from "./CoverArt";
import { CategoryIcon, CommentIcon, LampIcon, LikeIcon } from "./icons";

function PostCardView({ post, lang, priority }: { post: PostCardData; lang: Locale; priority: boolean }) {
  const t = getDictionary(lang);
  const cat = getCategory(post.category);
  const { title, excerpt, contentLang } = localizePost(post, lang);
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-sm transition duration-300 hover:-translate-y-1 hover:border-saffron/40 hover:shadow-xl hover:shadow-saffron/10">
      <CoverArt title={title} coverImage={post.coverImage} category={post.category} priority={priority} className="aspect-[16/9]" />
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center gap-2">
          {cat && (
            <Link
              href={localePath(lang, `/category/${cat.slug}`)}
              className="relative z-10 flex w-fit items-center gap-1.5 rounded-full bg-saffron-soft px-3 py-1 text-xs font-semibold text-saffron hover:brightness-95"
            >
              <CategoryIcon slug={cat.slug} className="size-3.5" />
              {categoryText(cat, lang).name}
            </Link>
          )}
          {contentLang !== lang && (
            <span className="rounded-full border border-line px-2 py-0.5 text-[11px] font-semibold text-muted">हिन्दी</span>
          )}
        </div>
        <h3
          lang={contentLang}
          className="font-serif text-xl font-bold leading-snug text-ink line-clamp-2 group-hover:text-saffron"
        >
          <Link href={localePath(lang, `/blog/${post.slug}`)} className="after:absolute after:inset-0">
            {title}
          </Link>
        </h3>
        <p lang={contentLang} className="mt-2 flex-1 text-muted line-clamp-3">
          {excerpt}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-line pt-4 text-sm text-muted">
          <span>
            <time dateTime={post.publishedAt?.toISOString()}>{formatDate(post.publishedAt, lang)}</time> ·{" "}
            {t.post.minShort(post.readingTime)}
          </span>
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1" aria-label={`${post.likeCount} ${t.post.like}`}>
              <LikeIcon className="size-4" aria-hidden /> {post.likeCount}
            </span>
            <span className="flex items-center gap-1" aria-label={`${post.commentCount} ${t.comments.title}`}>
              <CommentIcon className="size-4" aria-hidden /> {post.commentCount}
            </span>
          </span>
        </div>
      </div>
    </article>
  );
}

export async function PostCard({ post, priority = false }: { post: PostCardData; priority?: boolean }) {
  return <PostCardView post={post} lang={await getLocale()} priority={priority} />;
}

export async function PostGrid({ posts, columns = 3 }: { posts: PostCardData[]; columns?: 2 | 3 }) {
  const lang = await getLocale();
  if (!posts.length) {
    return (
      <div className="grid justify-items-center rounded-3xl border border-dashed border-line p-12 text-center text-muted">
        <LampIcon className="size-8 text-saffron" aria-hidden />
        <p className="mt-3">{getDictionary(lang).post.empty}</p>
      </div>
    );
  }
  return (
    <div className={`grid gap-6 sm:grid-cols-2 ${columns === 3 ? "lg:grid-cols-3" : ""}`}>
      {posts.map((p, i) => (
        <PostCardView key={p.id} post={p} lang={lang} priority={i < 3} />
      ))}
    </div>
  );
}
