import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { LockIcon } from "@/components/icons";
import { getAdmin, getSession } from "@/lib/auth";
import { localePath } from "@/lib/i18n";
import { getT } from "@/lib/locale";

// Reachable only through the secret ADMIN_LOGIN_PATH (see proxy.ts)
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const { lang, t } = await getT();
  const dashboard = localePath(lang, "/admin");
  if (await getAdmin()) redirect(dashboard);

  const session = await getSession();

  return (
    <section className="bg-pattern grid min-h-[70vh] place-items-center px-4 py-16">
      <div className="w-full max-w-md rounded-[2rem] border border-line bg-surface p-6 text-center shadow-xl shadow-saffron/5 md:p-8">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-gradient-to-br from-saffron to-maroon text-white shadow-lg">
          <LockIcon className="size-6" aria-hidden />
        </span>
        <h1 className="mt-5 font-serif text-2xl font-bold">{t.adminLogin.title}</h1>
        <p className="mt-2 text-sm text-muted">{t.adminLogin.text}</p>

        {session ? (
          // Signed in, but this account is not in ADMIN_EMAILS
          <p role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {t.adminLogin.notAdmin(session.user.email)}
          </p>
        ) : (
          <div className="mt-6">
            <AuthForm callbackURL={dashboard} allowSignUp={false} />
          </div>
        )}
      </div>
    </section>
  );
}
