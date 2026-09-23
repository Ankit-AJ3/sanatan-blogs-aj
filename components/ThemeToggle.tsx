"use client";

import { MoonIcon, SunIcon } from "./icons";
import { useLocale } from "./LocaleProvider";

export function ThemeToggle() {
  const { t } = useLocale();
  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
  }
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t.nav.theme}
      className="grid size-10 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-ink"
    >
      <MoonIcon className="size-5 dark:hidden" aria-hidden />
      <SunIcon className="hidden size-5 dark:block" aria-hidden />
    </button>
  );
}
