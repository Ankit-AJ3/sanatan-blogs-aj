import Link from "next/link";
import { categories, siteConfig } from "@/lib/site";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-muted">{siteConfig.description}</p>
          <p className="mt-6 font-serif text-lg text-saffron">॥ सर्वे भवन्तु सुखिनः ॥</p>
        </div>
        <div>
          <h2 className="mb-4 font-serif text-lg font-bold">श्रेणियाँ</h2>
          <ul className="space-y-2 text-muted">
            {categories.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link href={`/category/${c.slug}`} className="hover:text-saffron">
                  {c.nameHi}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-4 font-serif text-lg font-bold">लिंक</h2>
          <ul className="space-y-2 text-muted">
            <li>
              <Link href="/blog" className="hover:text-saffron">
                सभी लेख
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-saffron">
                हमारे बारे में
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
        © {new Date().getFullYear()} {siteConfig.name} · सनातन ज्ञान, सबके लिए 🙏
      </div>
    </footer>
  );
}
