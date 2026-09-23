import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryIcon } from "@/components/icons";
import { PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { PostGrid } from "@/components/PostCard";
import { getDictionary, isLocale, localePath } from "@/lib/i18n";
import { alternatesFor, getT } from "@/lib/locale";
import { getPublishedPosts } from "@/lib/posts";
import { categories, categoryText, getCategory } from "@/lib/site";

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/category/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  const cat = getCategory(slug);
  if (!cat) return { title: t.category.notFound };
  const text = categoryText(cat, lang);
  const other = lang === "en" ? cat.nameHi : cat.name;
  return {
    title: `${text.name} (${other})`,
    description: `${text.description} ${text.name} — ${t.category.metaSuffix}`,
    alternates: alternatesFor(lang, `/category/${cat.slug}`),
    openGraph: {
      title: `${text.name} | ${other}`,
      description: text.description,
      url: localePath(lang, `/category/${cat.slug}`),
    },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/[lang]/category/[slug]">) {
  const { lang, t } = await getT();
  const cat = getCategory((await params).slug);
  if (!cat) notFound();
  const text = categoryText(cat, lang);
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const { posts, totalPages } = await getPublishedPosts({ category: cat.slug, page });

  return (
    <>
      <PageHeader
        title={text.name}
        description={text.description}
        icon={<CategoryIcon slug={cat.slug} className="size-9 text-saffron" />}
        crumbs={[
          { name: t.category.title, href: "/category" },
          { name: text.name, href: `/category/${cat.slug}` },
        ]}
      />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <PostGrid posts={posts} />
        <Pagination page={page} totalPages={totalPages} basePath={localePath(lang, `/category/${cat.slug}`)} />
      </div>
    </>
  );
}
