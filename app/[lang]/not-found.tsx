import Link from "next/link";
import { localePath } from "@/lib/i18n";
import { getT } from "@/lib/locale";

export default async function NotFound() {
  const { lang, t } = await getT();
  return (
    <section className="bg-pattern grid min-h-[60vh] place-items-center px-4 text-center">
      <div>
        <p className="font-serif text-7xl font-bold text-saffron">{t.notFound.code}</p>
        <h1 className="mt-4 font-serif text-3xl font-bold">{t.notFound.title}</h1>
        <p className="mt-3 text-muted">{t.notFound.text}</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href={localePath(lang, "/")} className="rounded-full bg-saffron px-6 py-2.5 font-semibold text-white hover:brightness-110">
            {t.notFound.home}
          </Link>
          <Link href={localePath(lang, "/blog")} className="rounded-full border border-line px-6 py-2.5 font-semibold hover:border-saffron">
            {t.notFound.blog}
          </Link>
        </div>
      </div>
    </section>
  );
}
