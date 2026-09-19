"use client";

import { createContext, useContext } from "react";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";

const LocaleContext = createContext<Locale>("hi");

export function LocaleProvider({ lang, children }: { lang: Locale; children: React.ReactNode }) {
  return <LocaleContext.Provider value={lang}>{children}</LocaleContext.Provider>;
}

/** Current locale, its dictionary and a helper that builds localized paths. */
export function useLocale() {
  const lang = useContext(LocaleContext);
  return { lang, t: getDictionary(lang), href: (path: string) => localePath(lang, path) };
}
