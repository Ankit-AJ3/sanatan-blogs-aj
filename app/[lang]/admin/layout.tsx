import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdmin, getSession } from "@/lib/auth";
import { localePath } from "@/lib/i18n";
import { LockIcon } from "@/components/icons";
import { getT } from "@/lib/locale";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/[lang]/admin">) {
  const { lang, t } = await getT();
  if (!(await getSession())) redirect(`${localePath(lang, "/login")}?next=${encodeURIComponent(localePath(lang, "/admin"))}`);
  if (!(await getAdmin())) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <LockIcon className="mx-auto size-12 text-saffron" aria-hidden />
        <h1 className="mt-4 font-serif text-2xl font-bold">{t.admin.denied}</h1>
        <p className="mt-2 text-muted">{t.admin.deniedText}</p>
        <Link href={localePath(lang, "/")} className="mt-6 inline-block font-semibold text-saffron">
          {t.admin.backHome}
        </Link>
      </div>
    );
  }
  return <div className="mx-auto max-w-6xl px-4 py-10">{children}</div>;
}
