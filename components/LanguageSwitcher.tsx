"use client";

import { usePathname, useRouter } from "next/navigation";
import { LOCALE_COOKIE, localePath, stripLocale, type Locale } from "@/lib/i18n";
import { useLocale } from "./LocaleProvider";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { lang, t } = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const target: Locale = lang === "hi" ? "en" : "hi";

  function switchTo() {
    // Remember the choice so un-prefixed links open in the chosen language
    document.cookie = `${LOCALE_COOKIE}=${target}; path=/; max-age=31536000; samesite=lax`;
    router.push(localePath(target, stripLocale(pathname).path) + window.location.search);
  }

  return (
    <button
      type="button"
      onClick={switchTo}
      lang={target}
      aria-label={t.nav.switchLabel}
      title={t.nav.switchLabel}
      className={`flex h-10 items-center rounded-full border border-line bg-surface p-1 text-xs font-bold transition hover:border-saffron ${className}`}
    >
      {(["hi", "en"] as const).map((l) => (
        <span
          key={l}
          className={`grid h-full min-w-8 place-items-center rounded-full px-2 transition ${
            l === lang ? "bg-gradient-to-r from-saffron to-maroon text-white shadow" : "text-muted"
          }`}
        >
          {l === "hi" ? "हि" : "EN"}
        </span>
      ))}
    </button>
  );
}
