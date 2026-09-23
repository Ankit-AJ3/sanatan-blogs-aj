import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { Comments } from "@/components/Comments";
import { CoverArt } from "@/components/CoverArt";
import { CategoryIcon, GlobeIcon, InfoIcon } from "@/components/icons";
import { JsonLd } from "@/components/JsonLd";
import { LikeButton } from "@/components/LikeButton";
import { Markdown, extractHeadings } from "@/components/Markdown";
import { Breadcrumbs } from "@/components/PageHeader";
import { PostCard } from "@/components/PostCard";
import { ShareButtons } from "@/components/ShareButtons";
import { getSession } from "@/lib/auth";
import { bcp47, getDictionary, hasEnglish, isLocale, localePath, ogLocale, type Locale } from "@/lib/i18n";
import { alternatesFor, getT } from "@/lib/locale";
import { getComments, getLikeState, getPostBySlug, getRelatedPosts } from "@/lib/posts";
import { absoluteUrl, categoryText, getCategory, siteConfig } from "@/lib/site";
import { formatDate, parseTags, readingTime } from "@/lib/utils";

function decode(slug: string) {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

type FullPost = NonNullable<Awaited<ReturnType<typeof getPostBySlug>>>;

/** Text of the post in the requested language (falls back to Hindi when not translated). */
function postText(post: FullPost, lang: Locale) {
  const en = lang === "en" && hasEnglish(post);
  return {
    title: en ? post.titleEn! : post.title,
    excerpt: en ? post.excerptEn! : post.excerpt,
    content: en ? post.contentEn! : post.content,
    contentLang: (en ? "en" : "hi") as Locale,
    available: (hasEnglish(post) ? ["hi", "en"] : ["hi"]) as Locale[],
  };
}

export async function generateMetadata({ params }: PageProps<"/[lang]/blog/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const post = await getPostBySlug(decode(slug));
  if (!post) return { title: getDictionary(lang).notFound.postTitle, robots: { index: false } };

  const text = postText(post, lang);
  const path = `/blog/${post.slug}`;
  const cat = getCategory(post.category);
  const images = post.coverImage ? [{ url: post.coverImage, alt: text.title }] : undefined;
  return {
    title: text.title,
    description: text.excerpt,
    keywords: parseTags(post.tags),
    authors: [{ name: post.authorName }],
    category: cat?.name,
    // Untranslated posts viewed in English point their canonical at the Hindi original
    alternates: alternatesFor(lang, path, text.available),
    openGraph: {
      type: "article",
      url: localePath(lang, path),
      title: text.title,
      description: text.excerpt,
      siteName: siteConfig.name,
      locale: ogLocale[text.contentLang],
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.authorName],
      section: cat?.name,
      tags: parseTags(post.tags),
      // When there is no cover image, the generated opengraph-image.tsx is used automatically
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: text.title,
      description: text.excerpt,
      ...(images ? { images: images.map((i) => i.url) } : {}),
    },
  };
}

export default async function PostPage({ params }: PageProps<"/[lang]/blog/[slug]">) {
  const { lang, t } = await getT();
  const post = await getPostBySlug(decode((await params).slug));
  if (!post) notFound();

  const session = await getSession();
  const [likeState, comments, related] = await Promise.all([
    getLikeState(post.id, session?.user.id),
    getComments(post.id),
    getRelatedPosts(post.id, post.category),
  ]);

  const text = postText(post, lang);
  const cat = getCategory(post.category);
  const catText = cat ? categoryText(cat, lang) : null;
  const headings = extractHeadings(text.content);
  const tags = parseTags(post.tags);
  const path = `/blog/${post.slug}`;
  const url = absoluteUrl(localePath(lang, path));
  const minutes = text.contentLang === "en" ? readingTime(text.content) : post.readingTime;
  const otherLang: Locale = lang === "hi" ? "en" : "hi";
  const showOtherLink = text.available.includes(otherLang);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "@id": `${url}#article`,
          mainEntityOfPage: url,
          headline: text.title,
          description: text.excerpt,
          image: post.coverImage ?? absoluteUrl(`${localePath(lang, path)}/opengraph-image`),
          datePublished: post.publishedAt?.toISOString(),
          dateModified: post.updatedAt.toISOString(),
          inLanguage: bcp47[text.contentLang],
          // Link the Hindi original and its English translation to each other
          ...(showOtherLink
            ? text.contentLang === "en"
              ? { translationOfWork: { "@id": `${absoluteUrl(path)}#article` } }
              : { workTranslation: { "@id": `${absoluteUrl(localePath("en", path))}#article` } }
            : {}),
          articleSection: cat?.name,
          keywords: tags.join(", "),
          wordCount: text.content.split(/\s+/).length,
          timeRequired: `PT${minutes}M`,
          author: { "@type": "Person", name: post.authorName },
          publisher: { "@id": `${siteConfig.url}/#organization` },
          interactionStatistic: [
            { "@type": "InteractionCounter", interactionType: "https://schema.org/LikeAction", userInteractionCount: likeState.count },
            { "@type": "InteractionCounter", interactionType: "https://schema.org/CommentAction", userInteractionCount: comments.length },
          ],
          comment: comments.slice(0, 10).map((c) => ({
            "@type": "Comment",
            text: c.content,
            dateCreated: c.createdAt.toISOString(),
            author: { "@type": "Person", name: c.userName },
          })),
        }}
      />

      <article lang={text.contentLang}>
        <header className="bg-pattern border-b border-line">
          <div className="mx-auto max-w-3xl px-4 pb-10 pt-10 md:pt-14">
            <div lang={lang}>
              <Breadcrumbs
                items={[
                  ...(cat && catText ? [{ name: catText.name, href: `/category/${cat.slug}` }] : []),
                  { name: text.title, href: path },
                ]}
              />
            </div>
            <div lang={lang} className="mt-6 flex flex-wrap items-center gap-2">
              {cat && catText && (
                <Link
                  href={localePath(lang, `/category/${cat.slug}`)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-saffron-soft px-3 py-1 text-sm font-semibold text-saffron"
                >
                  <CategoryIcon slug={cat.slug} className="size-4" />
                  {catText.name}
                </Link>
              )}
              {showOtherLink && (
                <Link
                  href={localePath(otherLang, path)}
                  hrefLang={bcp47[otherLang]}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-sm font-semibold text-muted hover:border-saffron hover:text-saffron"
                >
                  <GlobeIcon className="size-4" aria-hidden />
                  {otherLang === "en" ? "Read in English" : "हिन्दी में पढ़ें"}
                </Link>
              )}
            </div>
            {text.contentLang !== lang && (
              <p
                lang={lang}
                className="mt-4 flex items-center gap-2 rounded-xl border border-gold/40 bg-saffron-soft px-4 py-2 text-sm"
              >
                <InfoIcon className="size-4 shrink-0" aria-hidden />
                {t.post.onlyInOther}
              </p>
            )}
            <h1 className="mt-4 font-serif text-3xl font-bold leading-tight md:text-5xl md:leading-tight">{text.title}</h1>
            <p className="mt-4 text-lg text-muted md:text-xl">{text.excerpt}</p>
            <div lang={lang} className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted">
              <Avatar name={post.authorName} size={40} />
              <div>
                <p className="font-semibold text-ink">{post.authorName}</p>
                <p>
                  <time dateTime={post.publishedAt?.toISOString()}>{formatDate(post.publishedAt, lang)}</time> ·{" "}
                  {t.post.minRead(minutes)}
                </p>
              </div>
            </div>
          </div>
        </header>

        {post.coverImage && (
          <div className="mx-auto mt-8 max-w-5xl px-4">
            <CoverArt
              title={text.title}
              coverImage={post.coverImage}
              category={post.category}
              priority
              sizes="(min-width: 1024px) 1024px, 100vw"
              className="aspect-[2/1] rounded-3xl"
            />
          </div>
        )}

        <div className="mx-auto grid max-w-6xl gap-10 px-4 pt-10 lg:grid-cols-[1fr_minmax(0,720px)_1fr]">
          <div className="hidden lg:block" />
          <div className="min-w-0">
            {headings.length > 2 && (
              <nav aria-label={t.post.toc} className="mb-8 rounded-2xl border border-line bg-surface p-5 lg:hidden">
                <p lang={lang} className="mb-2 font-serif font-bold">
                  {t.post.toc}
                </p>
                <TocList headings={headings} />
              </nav>
            )}

            <div className="article-content">
              <Markdown content={text.content} />
            </div>

            <div lang={lang}>
              {tags.length > 0 && (
                <ul className="mt-10 flex flex-wrap gap-2" aria-label={t.post.tags}>
                  {tags.map((tag) => (
                    <li key={tag}>
                      <Link
                        href={`${localePath(lang, "/blog")}?q=${encodeURIComponent(tag)}`}
                        className="rounded-full border border-line px-3 py-1 text-sm text-muted hover:border-saffron hover:text-saffron"
                      >
                        #{tag}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-line bg-surface p-5">
                <LikeButton
                  postId={post.id}
                  slug={post.slug}
                  initialCount={likeState.count}
                  initialLiked={likeState.liked}
                  isLoggedIn={!!session}
                />
                <ShareButtons url={url} title={text.title} />
              </div>

              <div className="mt-14">
                <Comments
                  postId={post.id}
                  slug={post.slug}
                  comments={comments}
                  viewer={
                    session
                      ? {
                          id: session.user.id,
                          name: session.user.name,
                          image: session.user.image,
                          isAdmin: session.user.isAdmin,
                        }
                      : null
                  }
                />
              </div>
            </div>
          </div>
          <aside className="hidden lg:block">
            {headings.length > 2 && (
              <nav aria-label={t.post.toc} className="sticky top-24 text-sm">
                <p lang={lang} className="mb-3 font-serif font-bold">
                  {t.post.toc}
                </p>
                <TocList headings={headings} />
              </nav>
            )}
          </aside>
        </div>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="mx-auto mt-20 max-w-6xl px-4">
          <h2 id="related-heading" className="mb-6 font-serif text-3xl font-bold">
            {t.post.related}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function TocList({ headings }: { headings: { id: string; text: string }[] }) {
  return (
    <ol className="space-y-2 border-l border-line">
      {headings.map((h) => (
        <li key={h.id}>
          <a
            href={`#${h.id}`}
            className="-ml-px block border-l-2 border-transparent pl-3 text-muted hover:border-saffron hover:text-saffron"
          >
            {h.text}
          </a>
        </li>
      ))}
    </ol>
  );
}
