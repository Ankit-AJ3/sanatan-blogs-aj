import type { Metadata } from "next";
import Link from "next/link";
import { CategoryIcon } from "@/components/icons";
import { PageHeader } from "@/components/PageHeader";
import { getDictionary, isLocale, localePath } from "@/lib/i18n";
import { alternatesFor, getT } from "@/lib/locale";
import { getCategoryCounts } from "@/lib/posts";
import { categories, categoryText } from "@/lib/site";

export const revalidate = 300;

export async function generateMetadata({ params }: PageProps<"/[lang]/category">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return {
    title: t.category.metaTitle,
    description: t.category.metaDescription,
    alternates: alternatesFor(lang, "/category"),
  };
}

export default async function CategoriesPage() {
  const { lang, t } = await getT();
  const counts = await getCategoryCounts();
  return (
    <>
      <PageHeader
        title={t.category.title}
        description={t.category.description}
        crumbs={[{ name: t.category.title, href: "/category" }]}
      />
      <div className="mx-auto grid max-w-6xl gap-5 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => {
          const text = categoryText(c, lang);
          return (
            <Link
              key={c.slug}
              href={localePath(lang, `/category/${c.slug}`)}
              className="group flex gap-4 rounded-3xl border border-line bg-surface p-6 transition hover:-translate-y-1 hover:border-saffron/50 hover:shadow-lg"
            >
              <span
                className="grid size-16 shrink-0 place-items-center rounded-2xl text-white"
                style={{ background: `linear-gradient(135deg, ${c.gradient[0]}, ${c.gradient[1]})` }}
                aria-hidden
              >
                <CategoryIcon slug={c.slug} className="size-7" />
              </span>
              <div>
                <h2 className="font-serif text-xl font-bold group-hover:text-saffron">{text.name}</h2>
                <p className="text-sm font-semibold text-saffron">{lang === "en" ? c.nameHi : c.name}</p>
                <p className="mt-2 text-muted">{text.description}</p>
                <p className="mt-2 text-sm text-muted">{t.post.articles(counts[c.slug] ?? 0)}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
