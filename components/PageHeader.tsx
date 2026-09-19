import Link from "next/link";
import { localePath } from "@/lib/i18n";
import { getT } from "@/lib/locale";
import { absoluteUrl } from "@/lib/site";
import { JsonLd } from "./JsonLd";

/** `href` is locale-less; it is localized here. */
export type Crumb = { name: string; href: string };

export async function Breadcrumbs({ items }: { items: Crumb[] }) {
  const { lang, t } = await getT();
  const all = [{ name: t.breadcrumbHome, href: "/" }, ...items].map((c) => ({ ...c, href: localePath(lang, c.href) }));
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          {all.map((c, i) => (
            <li key={c.href} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden>›</span>}
              {i === all.length - 1 ? (
                <span aria-current="page" className="line-clamp-1 text-ink">
                  {c.name}
                </span>
              ) : (
                <Link href={c.href} className="hover:text-saffron">
                  {c.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.name,
            item: absoluteUrl(c.href),
          })),
        }}
      />
    </>
  );
}

export function PageHeader({
  title,
  description,
  crumbs,
  icon,
}: {
  title: string;
  description?: string;
  crumbs: Crumb[];
  icon?: string;
}) {
  return (
    <section className="bg-pattern border-b border-line">
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <Breadcrumbs items={crumbs} />
        <h1 className="mt-4 flex items-center gap-3 font-serif text-4xl font-bold md:text-5xl">
          {icon && <span aria-hidden>{icon}</span>}
          {title}
        </h1>
        {description && <p className="mt-3 max-w-2xl text-lg text-muted">{description}</p>}
      </div>
    </section>
  );
}
