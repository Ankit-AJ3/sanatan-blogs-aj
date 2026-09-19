import type { MetadataRoute } from "next";
import { bcp47, localePath, locales, type Locale } from "@/lib/i18n";
import { getAllPublishedForSitemap } from "@/lib/posts";
import { absoluteUrl, categories } from "@/lib/site";

export const revalidate = 3600;

type Entry = MetadataRoute.Sitemap[number];

/** One sitemap entry per language version, each listing all versions as hreflang alternates. */
function localized(
  path: string,
  opts: Omit<Entry, "url" | "alternates">,
  available: readonly Locale[] = locales,
): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(available.map((l) => [bcp47[l], absoluteUrl(localePath(l, path))]));
  return available.map((l) => ({ ...opts, url: absoluteUrl(localePath(l, path)), alternates: { languages } }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPublishedForSitemap();
  const latest = posts[0]?.updatedAt ?? new Date();

  return [
    ...localized("/", { lastModified: latest, changeFrequency: "daily", priority: 1 }),
    ...localized("/blog", { lastModified: latest, changeFrequency: "daily", priority: 0.9 }),
    ...localized("/category", { changeFrequency: "weekly", priority: 0.6 }),
    ...localized("/about", { changeFrequency: "monthly", priority: 0.4 }),
    ...categories.flatMap((c) =>
      localized(`/category/${c.slug}`, {
        lastModified: posts.find((p) => p.category === c.slug)?.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      }),
    ),
    // Untranslated posts only exist in Hindi
    ...posts.flatMap((p) =>
      localized(
        `/blog/${encodeURIComponent(p.slug)}`,
        { lastModified: p.updatedAt, changeFrequency: "weekly", priority: 0.8 },
        p.titleEn ? locales : ["hi"],
      ),
    ),
  ];
}
