import Link from "next/link";
import { CoverArt } from "@/components/CoverArt";
import { PostGrid } from "@/components/PostCard";
import { getCategoryCounts, getFeaturedPost, getPopularPosts, getPublishedPosts } from "@/lib/posts";
import { categories, getCategory, siteConfig } from "@/lib/site";
import { formatDate } from "@/lib/utils";

export const revalidate = 300;

export default async function Home() {
  const [featured, latest, popular, counts] = await Promise.all([
    getFeaturedPost(),
    getPublishedPosts({ limit: 7 }),
    getPopularPosts(5),
    getCategoryCounts(),
  ]);
  const hero = featured ?? latest.posts[0] ?? null;
  const rest = latest.posts.filter((p) => p.id !== hero?.id).slice(0, 6);

  return (
    <>
      {/* Hero */}
      <section className="bg-pattern relative overflow-hidden border-b border-line">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-14 text-center md:pb-20 md:pt-20">
          <p className="font-serif text-lg text-saffron md:text-xl">॥ ॐ नमो भगवते वासुदेवाय ॥</p>
          <h1 className="mx-auto mt-4 max-w-3xl font-serif text-4xl font-bold leading-tight md:text-6xl">
            सनातन धर्म की <span className="bg-gradient-to-r from-saffron to-maroon bg-clip-text text-transparent">ज्ञान-गंगा</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted md:text-xl">
            वेद, उपनिषद, गीता, पुराण, त्योहार और तीर्थ — प्राचीन भारतीय ज्ञान को सरल भाषा में, आज के जीवन के लिए।
          </p>
          <form action="/blog" role="search" className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-full border border-line bg-surface p-1.5 shadow-lg shadow-saffron/5">
            <label htmlFor="hero-search" className="sr-only">
              लेख खोजें
            </label>
            <input
              id="hero-search"
              name="q"
              type="search"
              placeholder="गीता, दीपावली, योग… खोजें"
              className="min-w-0 flex-1 bg-transparent px-4 py-2 outline-none placeholder:text-muted/70"
            />
            <button className="rounded-full bg-gradient-to-r from-saffron to-maroon px-6 py-2.5 font-semibold text-white transition hover:brightness-110">
              खोजें
            </button>
          </form>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        {/* Featured */}
        {hero && (
          <section aria-labelledby="featured-heading" className="mt-14">
            <h2 id="featured-heading" className="sr-only">
              विशेष लेख
            </h2>
            <article className="group relative grid overflow-hidden rounded-[2rem] border border-line bg-surface shadow-sm transition hover:shadow-xl md:grid-cols-2">
              <CoverArt
                title={hero.title}
                coverImage={hero.coverImage}
                category={hero.category}
                priority
                sizes="(min-width: 768px) 50vw, 100vw"
                className="aspect-[16/10] md:aspect-auto md:min-h-[360px]"
              />
              <div className="flex flex-col justify-center p-7 md:p-10">
                <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-saffron">
                  <span>⭐ विशेष लेख</span>
                  <span className="text-line">•</span>
                  <span>{getCategory(hero.category)?.nameHi}</span>
                </p>
                <h3 className="font-serif text-2xl font-bold leading-snug md:text-3xl">
                  <Link href={`/blog/${hero.slug}`} className="after:absolute after:inset-0 group-hover:text-saffron">
                    {hero.title}
                  </Link>
                </h3>
                <p className="mt-4 text-lg text-muted line-clamp-3">{hero.excerpt}</p>
                <p className="mt-6 text-sm text-muted">
                  {hero.authorName} · {formatDate(hero.publishedAt)} · {hero.readingTime} मिनट पढ़ें
                </p>
                <span className="mt-6 inline-flex w-fit items-center gap-2 font-semibold text-saffron">
                  पूरा पढ़ें <span className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </div>
            </article>
          </section>
        )}

        {/* Categories */}
        <section aria-labelledby="cat-heading" className="mt-20">
          <SectionHeading id="cat-heading" title="श्रेणियाँ" subtitle="अपनी रुचि के विषय चुनें" href="/category" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                className="group relative overflow-hidden rounded-2xl p-5 text-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                style={{ background: `linear-gradient(135deg, ${c.gradient[0]}, ${c.gradient[1]})` }}
              >
                <span className="text-3xl" aria-hidden>
                  {c.icon}
                </span>
                <p className="mt-3 font-serif text-lg font-bold leading-tight">{c.nameHi}</p>
                <p className="text-sm text-white/80">{counts[c.slug] ?? 0} लेख</p>
                <span className="absolute -bottom-6 -right-4 text-8xl opacity-10 transition group-hover:opacity-20" aria-hidden>
                  {c.icon}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Latest + popular */}
        <section aria-labelledby="latest-heading" className="mt-20 grid gap-10 lg:grid-cols-[1fr_300px]">
          <div>
            <SectionHeading id="latest-heading" title="नवीनतम लेख" subtitle="हाल ही में प्रकाशित" href="/blog" />
            <div className="[&>div]:lg:grid-cols-2">
              <PostGrid posts={rest} />
            </div>
          </div>
          <aside aria-labelledby="popular-heading" className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-line bg-surface p-6">
              <h2 id="popular-heading" className="font-serif text-xl font-bold">
                🔥 लोकप्रिय लेख
              </h2>
              <ol className="mt-4 space-y-4">
                {popular.map((p, i) => (
                  <li key={p.id} className="flex gap-3">
                    <span className="font-serif text-2xl font-bold text-saffron/60">{i + 1}</span>
                    <div>
                      <Link href={`/blog/${p.slug}`} className="font-semibold leading-snug hover:text-saffron line-clamp-2">
                        {p.title}
                      </Link>
                      <p className="mt-1 text-xs text-muted">
                        🙏 {p.likeCount} · 💬 {p.commentCount}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="mt-6 rounded-3xl bg-gradient-to-br from-saffron to-maroon p-6 text-white">
              <p className="font-serif text-xl font-bold">चर्चा में शामिल हों</p>
              <p className="mt-2 text-white/85">Google से लॉगिन करें, लेख पसंद करें और अपने विचार साझा करें।</p>
              <Link href="/login" className="mt-4 inline-block rounded-full bg-white px-5 py-2 font-semibold text-maroon hover:bg-white/90">
                अभी जुड़ें
              </Link>
            </div>
          </aside>
        </section>

        {/* Quote */}
        <section className="mt-24 rounded-[2rem] border border-line bg-surface px-6 py-14 text-center">
          <p className="divider-ornament mx-auto max-w-xs text-2xl">✦</p>
          <blockquote className="mx-auto mt-6 max-w-3xl font-serif text-2xl leading-relaxed md:text-3xl">
            “यदा यदा हि धर्मस्य ग्लानिर्भवति भारत। अभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम्॥”
          </blockquote>
          <p className="mt-4 text-muted">— श्रीमद्भगवद्गीता 4.7</p>
          <p className="sr-only">{siteConfig.description}</p>
        </section>
      </div>
    </>
  );
}

function SectionHeading({ id, title, subtitle, href }: { id: string; title: string; subtitle: string; href?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 id={id} className="font-serif text-3xl font-bold">
          {title}
        </h2>
        <p className="mt-1 text-muted">{subtitle}</p>
      </div>
      {href && (
        <Link href={href} className="shrink-0 font-semibold text-saffron hover:underline">
          सभी देखें →
        </Link>
      )}
    </div>
  );
}
