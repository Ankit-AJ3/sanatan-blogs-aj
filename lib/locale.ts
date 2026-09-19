import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import type { Metadata } from "next";
import { bcp47, defaultLocale, getDictionary, isLocale, localePath, type Locale } from "./i18n";

/** Current locale from the [lang] root segment (Server Components only). */
export async function getLocale(): Promise<Locale> {
  const l = await lang();
  if (!isLocale(l)) notFound();
  return l;
}

export async function getT() {
  const locale = await getLocale();
  return { lang: locale, t: getDictionary(locale) };
}

/**
 * canonical + hreflang links for a locale-less path.
 * `available` lists the locales this page really exists in (e.g. an untranslated post is Hindi-only);
 * if the current locale isn't one of them, the canonical points to the default locale.
 */
export function alternatesFor(
  current: Locale,
  path: string,
  available: readonly Locale[] = ["hi", "en"],
): Metadata["alternates"] {
  const canonicalLocale = available.includes(current) ? current : defaultLocale;
  return {
    canonical: localePath(canonicalLocale, path),
    languages: {
      ...Object.fromEntries(available.map((l) => [bcp47[l], localePath(l, path)])),
      "x-default": localePath(available.includes(defaultLocale) ? defaultLocale : available[0], path),
    },
  };
}
