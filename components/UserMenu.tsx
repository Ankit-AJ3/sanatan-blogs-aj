"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Avatar } from "./Avatar";

export function UserMenu() {
  const { data: session, isPending } = authClient.useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

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
        href={`/login?next=${encodeURIComponent(pathname)}`}
        className="rounded-full bg-gradient-to-r from-saffron to-maroon px-4 py-2 text-sm font-semibold text-white shadow-md shadow-saffron/25 transition hover:brightness-110"
      >
        लॉगिन
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
        aria-label="User menu"
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
                <Link href="/admin" className="block rounded-lg px-3 py-2 hover:bg-surface-2">
                  📋 Admin Dashboard
                </Link>
                <Link href="/admin/new" className="block rounded-lg px-3 py-2 hover:bg-surface-2">
                  ✍️ नया लेख लिखें
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
              लॉगआउट
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
