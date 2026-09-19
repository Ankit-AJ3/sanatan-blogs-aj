import Link from "next/link";
import { PostEditor } from "@/components/admin/PostEditor";
import { localePath } from "@/lib/i18n";
import { getT } from "@/lib/locale";

export default async function NewPostPage() {
  const { lang, t } = await getT();
  return (
    <>
      <Link href={localePath(lang, "/admin")} className="text-sm text-muted hover:text-saffron">
        {t.admin.back}
      </Link>
      <h1 className="mb-8 mt-2 font-serif text-3xl font-bold">{t.admin.newPostTitle}</h1>
      <PostEditor />
    </>
  );
}
