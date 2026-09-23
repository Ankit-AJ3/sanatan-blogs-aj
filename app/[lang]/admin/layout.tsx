import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/[lang]/admin">) {
  // The dashboard simply does not exist for anyone who isn't an admin, so its
  // URL gives nothing away. Admins sign in through the secret ADMIN_LOGIN_PATH.
  if (!(await getAdmin())) notFound();
  return <div className="mx-auto max-w-6xl px-4 py-10">{children}</div>;
}
