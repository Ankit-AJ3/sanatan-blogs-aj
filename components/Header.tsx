import Link from "next/link";
import { localePath } from "@/lib/i18n";
import { getT } from "@/lib/locale";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

export async function Header() {
  const { lang, t } = await getT();
  const navLinks = [
    { href: localePath(lang, "/"), label: t.nav.home },
    { href: localePath(lang, "/blog"), label: t.nav.blog },
    { href: localePath(lang, "/category"), label: t.nav.categories },
    { href: localePath(lang, "/about"), label: t.nav.about },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2 text-[15px] font-medium text-muted transition hover:bg-surface-2 hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1.5">
          <Link
            href={`${localePath(lang, "/blog")}#search`}
            aria-label={t.nav.search}
            className="hidden size-10 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-ink sm:grid"
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </Link>
          <LanguageSwitcher />
          <ThemeToggle />
          <UserMenu />
          <MobileNav links={navLinks} />
        </div>
      </div>
    </header>
  );
}
