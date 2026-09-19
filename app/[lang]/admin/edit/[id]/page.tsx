import Link from "next/link";
import { notFound } from "next/navigation";
import { PostEditor } from "@/components/admin/PostEditor";
import { localePath } from "@/lib/i18n";
import { getT } from "@/lib/locale";
import { getPostById } from "@/lib/posts";

export default async function EditPostPage({ params }: PageProps<"/[lang]/admin/edit/[id]">) {
  const { lang, t } = await getT();
  const post = await getPostById((await params).id);
  if (!post) notFound();
  return (
    <>
      <Link href={localePath(lang, "/admin")} className="text-sm text-muted hover:text-saffron">
        {t.admin.back}
      </Link>
      <h1 className="mb-8 mt-2 font-serif text-3xl font-bold">{t.admin.editTitle}</h1>
      <PostEditor post={post} />
    </>
  );
}
