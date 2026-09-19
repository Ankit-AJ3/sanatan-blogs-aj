import Link from "next/link";
import { CoverArt } from "@/components/CoverArt";
import { PostGrid } from "@/components/PostCard";
import { localePath, localizePost } from "@/lib/i18n";
import { getT } from "@/lib/locale";
import { getCategoryCounts, getFeaturedPost, getPopularPosts, getPublishedPosts } from "@/lib/posts";
import { categories, categoryText, getCategory } from "@/lib/site";
import { formatDate } from "@/lib/utils";

export const revalidate = 300;

export default async function Home() {
  const { lang, t } = await getT();
  const [featured, latest, popular, counts] = await Promise.all([
    getFeaturedPost(),
    getPublishedPosts({ limit: 7 }),
    getPopularPosts(5),
    getCategoryCounts(),
  ]);
  const hero = featured ?? latest.posts[0] ?? null;
  const rest = latest.posts.filter((p) => p.id !== hero?.id).slice(0, 6);
  const heroText = hero ? localizePost(hero, lang) : null;
  const heroCat = hero ? getCategory(hero.category) : undefined;

  return (
    <>
      {/* Hero */}
      <section className="bg-pattern relative overflow-hidden border-b border-line">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-14 text-center md:pb-20 md:pt-20">
          <p lang="sa" className="font-serif text-lg text-saffron md:text-xl">
            {t.hero.mantra}
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl font-serif text-4xl font-bold leading-tight md:text-6xl">
            {t.hero.titleA}{" "}
            <span className="bg-gradient-to-r from-saffron to-maroon bg-clip-text text-transparent">{t.hero.titleB}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted md:text-xl">{t.hero.subtitle}</p>
          <form
            action={localePath(lang, "/blog")}
            role="search"
            className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-full border border-line bg-surface p-1.5 shadow-lg shadow-saffron/5"
          >
            <label htmlFor="hero-search" className="sr-only">
              {t.nav.search}
            </label>
            <input
              id="hero-search"
              name="q"
              type="search"
              placeholder={t.hero.searchPlaceholder}
              className="min-w-0 flex-1 bg-transparent px-4 py-2 outline-none placeholder:text-muted/70"
            />
            <button className="rounded-full bg-gradient-to-r from-saffron to-maroon px-6 py-2.5 font-semibold text-white transition hover:brightness-110">
              {t.hero.searchButton}
            </button>
          </form>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        {/* Featured */}
        {hero && heroText && (
          <section aria-labelledby="featured-heading" className="mt-14">
            <h2 id="featured-heading" className="sr-only">
              {t.home.featured}
            </h2>
            <article className="group relative grid overflow-hidden rounded-[2rem] border border-line bg-surface shadow-sm transition hover:shadow-xl md:grid-cols-2">
              <CoverArt
                title={heroText.title}
                coverImage={hero.coverImage}
                category={hero.category}
                priority
                sizes="(min-width: 768px) 50vw, 100vw"
                className="aspect-[16/10] md:aspect-auto md:min-h-[360px]"
              />
              <div className="flex flex-col justify-center p-7 md:p-10">
                <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-saffron">
                  <span>⭐ {t.home.featured}</span>
                  {heroCat && (
                    <>
                      <span className="text-line">•</span>
                      <span>{categoryText(heroCat, lang).name}</span>
                    </>
                  )}
                </p>
                <h3 lang={heroText.contentLang} className="font-serif text-2xl font-bold leading-snug md:text-3xl">
                  <Link
                    href={localePath(lang, `/blog/${hero.slug}`)}
                    className="after:absolute after:inset-0 group-hover:text-saffron"
                  >
                    {heroText.title}
                  </Link>
                </h3>
                <p lang={heroText.contentLang} className="mt-4 text-lg text-muted line-clamp-3">
                  {heroText.excerpt}
                </p>
                <p className="mt-6 text-sm text-muted">
                  {hero.authorName} · {formatDate(hero.publishedAt, lang)} · {t.post.minRead(hero.readingTime)}
                </p>
                <span className="mt-6 inline-flex w-fit items-center gap-2 font-semibold text-saffron">
                  {t.home.readMore} <span className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </div>
            </article>
          </section>
        )}

        {/* Categories */}
        <section aria-labelledby="cat-heading" className="mt-20">
          <SectionHeading
            id="cat-heading"
            title={t.home.categoriesTitle}
            subtitle={t.home.categoriesSub}
            href={localePath(lang, "/category")}
            linkText={t.home.viewAll}
          />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={localePath(lang, `/category/${c.slug}`)}
                className="group relative overflow-hidden rounded-2xl p-5 text-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                style={{ background: `linear-gradient(135deg, ${c.gradient[0]}, ${c.gradient[1]})` }}
              >
                <span className="text-3xl" aria-hidden>
                  {c.icon}
                </span>
                <p className="mt-3 font-serif text-lg font-bold leading-tight">{categoryText(c, lang).name}</p>
                <p className="text-sm text-white/80">{t.post.articles(counts[c.slug] ?? 0)}</p>
                <span
                  className="absolute -bottom-6 -right-4 text-8xl opacity-10 transition group-hover:opacity-20"
                  aria-hidden
                >
                  {c.icon}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Latest + popular */}
        <section aria-labelledby="latest-heading" className="mt-20 grid gap-10 lg:grid-cols-[1fr_300px]">
          <div>
            <SectionHeading
              id="latest-heading"
              title={t.home.latestTitle}
              subtitle={t.home.latestSub}
              href={localePath(lang, "/blog")}
              linkText={t.home.viewAll}
            />
            <PostGrid posts={rest} columns={2} />
          </div>
          <aside aria-labelledby="popular-heading" className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-line bg-surface p-6">
              <h2 id="popular-heading" className="font-serif text-xl font-bold">
                {t.home.popular}
              </h2>
              <ol className="mt-4 space-y-4">
                {popular.map((p, i) => {
                  const text = localizePost(p, lang);
                  return (
                    <li key={p.id} className="flex gap-3">
                      <span className="font-serif text-2xl font-bold text-saffron/60">{i + 1}</span>
                      <div>
                        <Link
                          href={localePath(lang, `/blog/${p.slug}`)}
                          lang={text.contentLang}
                          className="font-semibold leading-snug hover:text-saffron line-clamp-2"
                        >
                          {text.title}
                        </Link>
                        <p className="mt-1 text-xs text-muted">
                          🙏 {p.likeCount} · 💬 {p.commentCount}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
            <div className="mt-6 rounded-3xl bg-gradient-to-br from-saffron to-maroon p-6 text-white">
              <p className="font-serif text-xl font-bold">{t.home.joinTitle}</p>
              <p className="mt-2 text-white/85">{t.home.joinText}</p>
              <Link
                href={localePath(lang, "/login")}
                className="mt-4 inline-block rounded-full bg-white px-5 py-2 font-semibold text-maroon hover:bg-white/90"
              >
                {t.home.joinButton}
              </Link>
            </div>
          </aside>
        </section>

        {/* Quote */}
        <section className="mt-24 rounded-[2rem] border border-line bg-surface px-6 py-14 text-center">
          <p className="divider-ornament mx-auto max-w-xs text-2xl">✦</p>
          <blockquote lang="sa" className="mx-auto mt-6 max-w-3xl font-serif text-2xl leading-relaxed md:text-3xl">
            “यदा यदा हि धर्मस्य ग्लानिर्भवति भारत। अभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम्॥”
          </blockquote>
          {t.home.quoteMeaning && <p className="mx-auto mt-4 max-w-2xl italic text-muted">{t.home.quoteMeaning}</p>}
          <p className="mt-4 text-muted">{t.home.quoteSource}</p>
        </section>
      </div>
    </>
  );
}

function SectionHeading({
  id,
  title,
  subtitle,
  href,
  linkText,
}: {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  linkText: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 id={id} className="font-serif text-3xl font-bold">
          {title}
        </h2>
        <p className="mt-1 text-muted">{subtitle}</p>
      </div>
      <Link href={href} className="shrink-0 font-semibold text-saffron hover:underline">
        {linkText}
      </Link>
    </div>
  );
}
