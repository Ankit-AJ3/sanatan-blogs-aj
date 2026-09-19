"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { stripLocale } from "@/lib/i18n";
import { Avatar } from "./Avatar";
import { useLocale } from "./LocaleProvider";

export function UserMenu() {
  const { data: session, isPending } = authClient.useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { t, href } = useLocale();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  if (isPending) return <div className="size-10 animate-pulse rounded-full bg-surface-2" />;

  if (!session) {
    return (
      <Link
        href={`${href("/login")}?next=${encodeURIComponent(href(stripLocale(pathname).path))}`}
        className="whitespace-nowrap rounded-full bg-gradient-to-r from-saffron to-maroon px-4 py-2 text-sm font-semibold text-white shadow-md shadow-saffron/25 transition hover:brightness-110"
      >
        {t.nav.login}
      </Link>
    );
  }

  const { user } = session;
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={t.nav.userMenu}
        className="block rounded-full ring-2 ring-transparent transition hover:ring-saffron"
      >
        <Avatar name={user.name} image={user.image} size={40} />
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-60 overflow-hidden rounded-2xl border border-line bg-surface shadow-xl">
          <div className="border-b border-line px-4 py-3">
            <p className="truncate font-semibold">{user.name}</p>
            <p className="truncate text-sm text-muted">{user.email}</p>
          </div>
          <nav className="p-1.5 text-sm" onClick={() => setOpen(false)}>
            {user.isAdmin && (
              <>
                <Link href={href("/admin")} className="block rounded-lg px-3 py-2 hover:bg-surface-2">
                  📋 {t.nav.admin}
                </Link>
                <Link href={href("/admin/new")} className="block rounded-lg px-3 py-2 hover:bg-surface-2">
                  ✍️ {t.nav.newPost}
                </Link>
              </>
            )}
            <button
              type="button"
              onClick={async () => {
                await authClient.signOut();
                router.refresh();
              }}
              className="block w-full rounded-lg px-3 py-2 text-left text-red-600 hover:bg-surface-2"
            >
              {t.nav.logout}
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
