import Link from "next/link";
import { localePath } from "@/lib/i18n";
import { getT } from "@/lib/locale";
import { categories, categoryText, siteConfig, siteText } from "@/lib/site";
import { Logo } from "./Logo";

export async function Footer() {
  const { lang, t } = await getT();
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-muted">{siteText(lang).description}</p>
          <p className="mt-6 font-serif text-lg text-saffron">{t.footer.motto}</p>
        </div>
        <div>
          <h2 className="mb-4 font-serif text-lg font-bold">{t.footer.categories}</h2>
          <ul className="space-y-2 text-muted">
            {categories.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link href={localePath(lang, `/category/${c.slug}`)} className="hover:text-saffron">
                  {categoryText(c, lang).name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-4 font-serif text-lg font-bold">{t.footer.links}</h2>
          <ul className="space-y-2 text-muted">
            <li>
              <Link href={localePath(lang, "/blog")} className="hover:text-saffron">
                {t.nav.blog}
              </Link>
            </li>
            <li>
              <Link href={localePath(lang, "/about")} className="hover:text-saffron">
                {t.nav.about}
              </Link>
            </li>
            <li>
              <a href="/feed.xml" className="hover:text-saffron">
                RSS Feed
              </a>
            </li>
            <li>
              <a href="/sitemap.xml" className="hover:text-saffron">
                Sitemap
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-5 text-center text-sm text-muted">
        © {new Date().getFullYear()} {siteConfig.name} · {t.footer.copyright}
      </div>
    </footer>
  );
}
