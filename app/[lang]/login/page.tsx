import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignInButton } from "@/components/SignInButton";
import { getSession } from "@/lib/auth";
import { getDictionary, isLocale, localePath } from "@/lib/i18n";
import { getT } from "@/lib/locale";

export async function generateMetadata({ params }: PageProps<"/[lang]/login">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return { title: t.login.metaTitle, description: t.login.metaDescription, robots: { index: false, follow: true } };
}

function safeNext(next: unknown, fallback: string) {
  // Only allow same-site relative paths to avoid open redirects
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

export default async function LoginPage({ searchParams }: PageProps<"/[lang]/login">) {
  const { lang, t } = await getT();
  const next = safeNext((await searchParams).next, localePath(lang, "/"));
  if (await getSession()) redirect(next);

  return (
    <section className="bg-pattern grid min-h-[70vh] place-items-center px-4 py-16">
      <div className="w-full max-w-md rounded-[2rem] border border-line bg-surface p-8 text-center shadow-xl shadow-saffron/5 md:p-10">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-gradient-to-br from-saffron to-maroon text-3xl text-white shadow-lg">
          ॐ
        </span>
        <h1 className="mt-5 font-serif text-3xl font-bold">{t.login.welcome}</h1>
        <p className="mt-3 text-muted">{t.login.text}</p>
        <div className="mt-8">
          <SignInButton callbackURL={next} label={t.login.button} className="w-full py-3" />
        </div>
        <ul className="mt-8 space-y-2 text-left text-sm text-muted">
          {t.login.points.map((p) => (
            <li key={p}>✦ {p}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
