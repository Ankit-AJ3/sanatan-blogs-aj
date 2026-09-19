"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale } from "./LocaleProvider";

export function MobileNav({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const { t } = useLocale();
  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t.nav.menu}
        aria-expanded={open}
        className="grid size-10 place-items-center rounded-full text-ink hover:bg-surface-2"
      >
        <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
      {open && (
        <nav
          aria-label="Mobile"
          className="absolute inset-x-0 top-16 border-b border-line bg-bg px-4 pb-4 shadow-lg"
          onClick={() => setOpen(false)}
        >
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="block border-b border-line/60 py-3 text-lg font-medium last:border-0">
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
