"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdmin, getSession } from "@/lib/auth";
import { deleteImage } from "@/lib/cloudinary";
import { ObjectId, comments, likes, posts, toObjectId } from "@/lib/db";
import { isLocale, localePath, type CommentErrorCode, type EditorErrorCode } from "@/lib/i18n";
import { getCategory } from "@/lib/site";
import { readingTime, slugify } from "@/lib/utils";

// Pages live under the [lang] segment (both languages), so revalidate the whole tree.
// The blog is small, so this is cheap and keeps listings, counts and sitemap in sync.
const revalidateSite = () => revalidatePath("/", "layout");

// ---------------- Likes ----------------
export async function toggleLike(postId: string) {
  const session = await getSession();
  if (!session) return { error: "login" as const };

  const id = toObjectId(postId);
  if (!id || !(await posts.countDocuments({ _id: id }, { limit: 1 }))) return { error: "notFound" as const };

  const filter = { postId: id, userId: session.user.id };
  const existing = await likes.findOne(filter);
  if (existing) {
    await likes.deleteOne(filter);
  } else {
    await likes.updateOne(filter, { $setOnInsert: { ...filter, createdAt: new Date() } }, { upsert: true });
  }

  revalidateSite();
  return { liked: !existing };
}

// ---------------- Comments ----------------
export type CommentState = { error?: CommentErrorCode; ok?: boolean };

export async function addComment(postId: string, _prev: CommentState, formData: FormData): Promise<CommentState> {
  const session = await getSession();
  if (!session) return { error: "login" };

  const content = String(formData.get("content") ?? "").trim();
  if (content.length < 2) return { error: "short" };
  if (content.length > 2000) return { error: "long" };

  const id = toObjectId(postId);
  if (!id || !(await posts.countDocuments({ _id: id }, { limit: 1 }))) return { error: "notFound" };

  await comments.insertOne({
    _id: new ObjectId(),
    postId: id,
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
  const id = toObjectId(commentId);
  if (!id) return;

  const row = await comments.findOne({ _id: id });
  if (!row) return;
  if (row.userId !== session.user.id && !session.user.isAdmin) return;

  await comments.deleteOne({ _id: id });
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
  const coverImageId = field("coverImageId") || null;
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

  const existingId = id ? toObjectId(id) : null;
  if (id && !existingId) return { error: "notFound" };

  const clash = await posts.findOne({ slug }, { projection: { _id: 1 } });
  if (clash && (!existingId || !clash._id.equals(existingId))) return { error: "slug", slug };

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
    coverImageId,
    tags,
    published,
    featured,
    readingTime: readingTime(content),
    updatedAt: now,
  };

  let savedId: ObjectId;
  if (existingId) {
    const existing = await posts.findOne({ _id: existingId });
    if (!existing) return { error: "notFound" };
    await posts.updateOne(
      { _id: existingId },
      { $set: { ...values, publishedAt: published ? (existing.publishedAt ?? now) : existing.publishedAt } },
    );
    savedId = existingId;
    // The cover image was replaced or removed — clean up the old Cloudinary file
    if (existing.coverImageId && existing.coverImageId !== coverImageId) await deleteImage(existing.coverImageId);
  } else {
    savedId = new ObjectId();
    await posts.insertOne({
      _id: savedId,
      ...values,
      authorId: admin.user.id,
      authorName: admin.user.name,
      createdAt: now,
      publishedAt: published ? now : null,
    });
  }

  // Only one featured post at a time
  if (featured) await posts.updateMany({ _id: { $ne: savedId } }, { $set: { featured: false } });

  revalidateSite();
  redirect(localePath(uiLang, published ? `/blog/${slug}` : "/admin"));
}

export async function deletePost(id: string) {
  const admin = await getAdmin();
  if (!admin) return;
  const _id = toObjectId(id);
  if (!_id) return;

  const existing = await posts.findOne({ _id });
  if (!existing) return;

  await Promise.all([
    posts.deleteOne({ _id }),
    likes.deleteMany({ postId: _id }),
    comments.deleteMany({ postId: _id }),
    deleteImage(existing.coverImageId),
  ]);
  revalidateSite();
}
