import { hasEnglish, isLocale } from "@/lib/i18n";
import { renderOg, ogSize } from "@/lib/og";
import { getPostBySlug } from "@/lib/posts";
import { getCategory, siteConfig } from "@/lib/site";

export const alt = siteConfig.name;
export const size = ogSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {}
  const post = await getPostBySlug(decoded);
  const cat = getCategory(post?.category ?? "");
  // English titles render well; Hindi titles fall back to the category name (see lib/og.tsx)
  const heading = post ? (isLocale(lang) && lang === "en" && hasEnglish(post) ? post.titleEn! : post.title) : siteConfig.name;
  return renderOg({
    heading,
    fallbackHeading: cat?.name,
    subheading: post ? `${cat?.name ?? "Sanatan Blogs"} · ${post.readingTime} min read` : "Wisdom of Sanatan Dharma",
    gradient: cat?.gradient,
  });
}
