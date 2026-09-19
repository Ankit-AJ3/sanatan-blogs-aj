import Link from "next/link";
import { localePath } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { siteConfig } from "@/lib/site";

export async function Logo({ className = "" }: { className?: string }) {
  const lang = await getLocale();
  return (
    <Link
      href={localePath(lang, "/")}
      className={`group flex items-center gap-2.5 ${className}`}
      aria-label={`${siteConfig.name} — ${lang === "en" ? "Home" : "होम"}`}
    >
      <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-saffron to-maroon text-xl text-white shadow-md shadow-saffron/30 transition-transform group-hover:rotate-12">
        ॐ
      </span>
      <span className="leading-tight">
        {lang === "en" ? (
          <>
            <span className="block font-serif text-lg font-bold text-ink">Sanatan Blogs</span>
            <span className="block text-[11px] font-semibold tracking-[0.15em] text-saffron">{siteConfig.nameHi}</span>
          </>
        ) : (
          <>
            <span className="block font-serif text-lg font-bold text-ink">{siteConfig.nameHi}</span>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-saffron">Sanatan Blogs</span>
          </>
        )}
      </span>
    </Link>
  );
}
