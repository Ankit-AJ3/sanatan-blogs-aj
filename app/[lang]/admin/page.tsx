import Link from "next/link";
import { DeletePostButton } from "@/components/admin/DeletePostButton";
import { localePath } from "@/lib/i18n";
import { getT } from "@/lib/locale";
import { getAdminStats, getAllPostsForAdmin } from "@/lib/posts";
import { categoryText, getCategory } from "@/lib/site";
import { formatDate } from "@/lib/utils";

export default async function AdminPage() {
  const { lang, t } = await getT();
  const [stats, posts] = await Promise.all([getAdminStats(), getAllPostsForAdmin()]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold">{t.admin.dashboard}</h1>
          <p className="text-muted">{t.admin.manage}</p>
        </div>
        <Link
          href={localePath(lang, "/admin/new")}
          className="rounded-full bg-gradient-to-r from-saffron to-maroon px-5 py-2.5 font-semibold text-white shadow-md hover:brightness-110"
        >
          {t.admin.newPost}
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {(
          [
            ["📝", t.admin.stats.posts, stats.posts],
            ["🙏", t.admin.stats.likes, stats.likes],
            ["💬", t.admin.stats.comments, stats.comments],
            ["👥", t.admin.stats.users, stats.users],
          ] as const
        ).map(([icon, label, n]) => (
          <div key={label} className="rounded-2xl border border-line bg-surface p-5">
            <p className="text-2xl">{icon}</p>
            <p className="mt-2 text-3xl font-bold">{n}</p>
            <p className="text-sm text-muted">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b border-line bg-surface-2 text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">{t.admin.cols.title}</th>
              <th className="px-4 py-3 font-semibold">{t.admin.cols.category}</th>
              <th className="px-4 py-3 font-semibold">{t.admin.cols.languages}</th>
              <th className="px-4 py-3 font-semibold">{t.admin.cols.status}</th>
              <th className="px-4 py-3 font-semibold">🙏 / 💬</th>
              <th className="px-4 py-3 font-semibold">{t.admin.cols.updated}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => {
              const cat = getCategory(p.category);
              return (
                <tr key={p.id} className="border-b border-line/60 last:border-0">
                  <td className="max-w-xs px-4 py-3">
                    <p className="font-semibold line-clamp-1">
                      {p.featured && "⭐ "}
                      {lang === "en" && p.titleEn ? p.titleEn : p.title}
                    </p>
                    <p className="text-xs text-muted line-clamp-1">/blog/{p.slug}</p>
                  </td>
                  <td className="px-4 py-3">{cat && categoryText(cat, lang).name}</td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-surface-2 px-1.5 py-0.5 text-xs font-semibold">हि</span>{" "}
                    {p.titleEn ? (
                      <span className="rounded bg-surface-2 px-1.5 py-0.5 text-xs font-semibold">EN</span>
                    ) : (
                      <span className="text-xs text-muted line-through">EN</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        p.published ? "bg-green-100 text-green-800" : "bg-surface-2 text-muted"
                      }`}
                    >
                      {p.published ? t.admin.published : t.admin.draft}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {p.likeCount} / {p.commentCount}
                  </td>
                  <td className="px-4 py-3 text-muted">{formatDate(p.updatedAt, lang)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3">
                      {p.published && (
                        <Link href={localePath(lang, `/blog/${p.slug}`)} className="text-muted hover:text-ink">
                          {t.admin.view}
                        </Link>
                      )}
                      <Link href={localePath(lang, `/admin/edit/${p.id}`)} className="font-semibold text-saffron">
                        {t.admin.edit}
                      </Link>
                      <DeletePostButton id={p.id} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {!posts.length && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted">
                  {t.admin.noPosts}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
