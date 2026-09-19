import Link from "next/link";
import { getT } from "@/lib/locale";

export async function Pagination({
  page,
  totalPages,
  basePath,
  query,
}: {
  page: number;
  totalPages: number;
  /** Already localized path */
  basePath: string;
  query?: string;
}) {
  if (totalPages <= 1) return null;
  const { t } = await getT();
  const href = (p: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  const btn = "grid min-w-10 h-10 place-items-center rounded-full border border-line px-3 font-semibold transition";
  return (
    <nav aria-label="Pagination" className="mt-12 flex flex-wrap items-center justify-center gap-2">
      {page > 1 && (
        <Link href={href(page - 1)} rel="prev" className={`${btn} hover:border-saffron hover:text-saffron`}>
          {t.blog.prev}
        </Link>
      )}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <Link
          key={p}
          href={href(p)}
          aria-current={p === page ? "page" : undefined}
          className={`${btn} ${p === page ? "border-saffron bg-saffron text-white" : "hover:border-saffron hover:text-saffron"}`}
        >
          {p}
        </Link>
      ))}
      {page < totalPages && (
        <Link href={href(page + 1)} rel="next" className={`${btn} hover:border-saffron hover:text-saffron`}>
          {t.blog.next}
        </Link>
      )}
    </nav>
  );
}
