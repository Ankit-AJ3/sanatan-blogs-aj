"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdmin, getSession } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { isLocale, localePath, type CommentErrorCode, type EditorErrorCode } from "@/lib/i18n";
import { getCategory } from "@/lib/site";
import { readingTime, slugify } from "@/lib/utils";

const { posts, likes, comments } = schema;

// Pages live under the [lang] segment (both languages), so revalidate the whole tree.
// The blog is small, so this is cheap and keeps listings, counts and sitemap in sync.
const revalidateSite = () => revalidatePath("/", "layout");

async function postExists(postId: string) {
  const [row] = await db.select({ id: posts.id }).from(posts).where(eq(posts.id, postId)).limit(1);
  return !!row;
}

// ---------------- Likes ----------------
export async function toggleLike(postId: string) {
  const session = await getSession();
  if (!session) return { error: "login" as const };
  if (!(await postExists(postId))) return { error: "notFound" as const };

  const where = and(eq(likes.postId, postId), eq(likes.userId, session.user.id));
  const existing = await db.select().from(likes).where(where).limit(1);
  if (existing.length) {
    await db.delete(likes).where(where);
  } else {
    await db.insert(likes).values({ postId, userId: session.user.id, createdAt: new Date() }).onConflictDoNothing();
  }

  revalidateSite();
  return { liked: !existing.length };
}

// ---------------- Comments ----------------
export type CommentState = { error?: CommentErrorCode; ok?: boolean };

export async function addComment(postId: string, _prev: CommentState, formData: FormData): Promise<CommentState> {
  const session = await getSession();
  if (!session) return { error: "login" };

  const content = String(formData.get("content") ?? "").trim();
  if (content.length < 2) return { error: "short" };
  if (content.length > 2000) return { error: "long" };
  if (!(await postExists(postId))) return { error: "notFound" };

  await db.insert(comments).values({
    id: crypto.randomUUID(),
    postId,
    userId: session.user.id,
    content,
    createdAt: new Date(),
  });
  revalidateSite();
  return { ok: true };
}

export async function deleteComment(commentId: string) {
  const session = await getSession();
  if (!session) return;
  const [row] = await db.select().from(comments).where(eq(comments.id, commentId)).limit(1);
  if (!row) return;
  if (row.userId !== session.user.id && !session.user.isAdmin) return;

  await db.delete(comments).where(eq(comments.id, commentId));
  revalidateSite();
}

// ---------------- Posts (admin) ----------------
export type PostFormState = { error?: EditorErrorCode; slug?: string };

export async function savePost(_prev: PostFormState, formData: FormData): Promise<PostFormState> {
  const admin = await getAdmin();
  if (!admin) return { error: "unauthorized" };

  const field = (name: string) => String(formData.get(name) ?? "").trim();
  const uiLang = isLocale(formData.get("lang")) ? (formData.get("lang") as "hi" | "en") : "hi";

  const id = field("id") || null;
  const title = field("title");
  const excerpt = field("excerpt");
  const content = field("content");
  const titleEn = field("titleEn");
  const excerptEn = field("excerptEn");
  const contentEn = field("contentEn");
  const category = field("category");
  const coverImage = field("coverImage") || null;
  const tags = field("tags")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .join(", ");
  const published = formData.get("published") === "on";
  const featured = formData.get("featured") === "on";
  const slug = slugify(field("slug") || titleEn || title);

  if (title.length < 3) return { error: "title" };
  if (excerpt.length < 20) return { error: "excerpt" };
  if (content.length < 50) return { error: "content" };
  const enFilled = [titleEn, excerptEn, contentEn].filter(Boolean).length;
  if (enFilled > 0 && enFilled < 3) return { error: "english" };
  if (!getCategory(category)) return { error: "category" };
  if (coverImage && !/^https?:\/\//.test(coverImage) && !coverImage.startsWith("/")) return { error: "cover" };

  const [clash] = await db.select({ id: posts.id }).from(posts).where(eq(posts.slug, slug)).limit(1);
  if (clash && clash.id !== id) return { error: "slug", slug };

  const now = new Date();
  const values = {
    slug,
    title,
    excerpt,
    content,
    titleEn: titleEn || null,
    excerptEn: excerptEn || null,
    contentEn: contentEn || null,
    category,
    coverImage,
    tags,
    published,
    featured,
    readingTime: readingTime(content),
    updatedAt: now,
  };

  if (id) {
    const [existing] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    if (!existing) return { error: "notFound" };
    await db
      .update(posts)
      .set({ ...values, publishedAt: published ? (existing.publishedAt ?? now) : existing.publishedAt })
      .where(eq(posts.id, id));
  } else {
    await db.insert(posts).values({
      ...values,
      id: crypto.randomUUID(),
      authorId: admin.user.id,
      authorName: admin.user.name,
      createdAt: now,
      publishedAt: published ? now : null,
    });
  }

  // Only one featured post at a time
  if (featured) await db.update(posts).set({ featured: false }).where(ne(posts.slug, slug));

  revalidateSite();
  redirect(localePath(uiLang, published ? `/blog/${slug}` : "/admin"));
}

export async function deletePost(id: string) {
  const admin = await getAdmin();
  if (!admin) return;
  await db.delete(posts).where(eq(posts.id, id));
  revalidateSite();
}
