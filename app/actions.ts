"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdmin, getSession } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { getCategory } from "@/lib/site";
import { readingTime, slugify } from "@/lib/utils";

const { posts, likes, comments } = schema;

async function postPath(postId: string) {
  const [row] = await db.select({ slug: posts.slug }).from(posts).where(eq(posts.id, postId)).limit(1);
  return row ? `/blog/${row.slug}` : null;
}

// ---------------- Likes ----------------
export async function toggleLike(postId: string) {
  const session = await getSession();
  if (!session) return { error: "login" as const };

  const where = and(eq(likes.postId, postId), eq(likes.userId, session.user.id));
  const existing = await db.select().from(likes).where(where).limit(1);
  if (existing.length) {
    await db.delete(likes).where(where);
  } else {
    await db.insert(likes).values({ postId, userId: session.user.id, createdAt: new Date() }).onConflictDoNothing();
  }

  const path = await postPath(postId);
  if (path) revalidatePath(path);
  revalidatePath("/");
  return { liked: !existing.length };
}

// ---------------- Comments ----------------
export type CommentState = { error?: string; ok?: boolean };

export async function addComment(postId: string, _prev: CommentState, formData: FormData): Promise<CommentState> {
  const session = await getSession();
  if (!session) return { error: "टिप्पणी करने के लिए कृपया Google से लॉगिन करें।" };

  const content = String(formData.get("content") ?? "").trim();
  if (content.length < 2) return { error: "टिप्पणी बहुत छोटी है।" };
  if (content.length > 2000) return { error: "टिप्पणी 2000 अक्षरों से कम होनी चाहिए।" };

  const path = await postPath(postId);
  if (!path) return { error: "लेख नहीं मिला।" };

  await db.insert(comments).values({
    id: crypto.randomUUID(),
    postId,
    userId: session.user.id,
    content,
    createdAt: new Date(),
  });
  revalidatePath(path);
  return { ok: true };
}

export async function deleteComment(commentId: string) {
  const session = await getSession();
  if (!session) return;
  const [row] = await db.select().from(comments).where(eq(comments.id, commentId)).limit(1);
  if (!row) return;
  if (row.userId !== session.user.id && !session.user.isAdmin) return;

  await db.delete(comments).where(eq(comments.id, commentId));
  const path = await postPath(row.postId);
  if (path) revalidatePath(path);
}

// ---------------- Posts (admin) ----------------
export type PostFormState = { error?: string };

export async function savePost(_prev: PostFormState, formData: FormData): Promise<PostFormState> {
  const admin = await getAdmin();
  if (!admin) return { error: "सिर्फ़ Admin लेख प्रकाशित कर सकते हैं।" };

  const id = String(formData.get("id") ?? "") || null;
  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const coverImage = String(formData.get("coverImage") ?? "").trim() || null;
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .join(", ");
  const published = formData.get("published") === "on";
  const featured = formData.get("featured") === "on";
  const slug = slugify(String(formData.get("slug") ?? "").trim() || title);

  if (title.length < 3) return { error: "शीर्षक (Title) कम से कम 3 अक्षरों का होना चाहिए।" };
  if (excerpt.length < 20) return { error: "सारांश (Excerpt) कम से कम 20 अक्षरों का होना चाहिए — यह Google में दिखता है।" };
  if (content.length < 50) return { error: "लेख की सामग्री बहुत छोटी है।" };
  if (!getCategory(category)) return { error: "कृपया एक श्रेणी चुनें।" };
  if (coverImage && !/^https?:\/\//.test(coverImage) && !coverImage.startsWith("/"))
    return { error: "Cover image एक मान्य URL होना चाहिए।" };

  const [clash] = await db.select({ id: posts.id }).from(posts).where(eq(posts.slug, slug)).limit(1);
  if (clash && clash.id !== id) return { error: `Slug "${slug}" पहले से उपयोग में है। कृपया दूसरा slug दें।` };

  const now = new Date();
  const values = {
    slug,
    title,
    excerpt,
    content,
    category,
    coverImage,
    tags,
    published,
    featured,
    readingTime: readingTime(content),
    updatedAt: now,
  };

  let previousSlug: string | null = null;
  if (id) {
    const [existing] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    if (!existing) return { error: "लेख नहीं मिला।" };
    previousSlug = existing.slug;
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

  if (featured) {
    // Only one featured post at a time
    await db.update(posts).set({ featured: false }).where(ne(posts.slug, slug));
  }

  revalidateBlog([slug, previousSlug], category);
  redirect(published ? `/blog/${slug}` : "/admin");
}

export async function deletePost(id: string) {
  const admin = await getAdmin();
  if (!admin) return;
  const [existing] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (!existing) return;
  await db.delete(posts).where(eq(posts.id, id));
  revalidateBlog([existing.slug], existing.category);
}

function revalidateBlog(slugs: (string | null)[], category: string) {
  for (const s of new Set(slugs)) if (s) revalidatePath(`/blog/${s}`);
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/category/${category}`);
  revalidatePath("/admin");
  revalidatePath("/sitemap.xml");
  revalidatePath("/feed.xml");
}
