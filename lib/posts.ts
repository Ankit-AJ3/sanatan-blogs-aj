import "server-only";
import { and, count, desc, eq, like, ne, or, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";

const { posts, likes, comments, user } = schema;

const published = eq(posts.published, true);

export const PAGE_SIZE = 9;

export type PostCardData = Pick<
  typeof posts.$inferSelect,
  "id" | "slug" | "title" | "excerpt" | "coverImage" | "category" | "authorName" | "readingTime" | "publishedAt"
> & { likeCount: number; commentCount: number };

const cardColumns = {
  id: posts.id,
  slug: posts.slug,
  title: posts.title,
  excerpt: posts.excerpt,
  coverImage: posts.coverImage,
  category: posts.category,
  authorName: posts.authorName,
  readingTime: posts.readingTime,
  publishedAt: posts.publishedAt,
  likeCount: sql<number>`(select count(*) from ${likes} where ${likes.postId} = ${posts.id})`.mapWith(Number),
  commentCount: sql<number>`(select count(*) from ${comments} where ${comments.postId} = ${posts.id})`.mapWith(
    Number,
  ),
};

export async function getPublishedPosts({
  page = 1,
  category,
  query,
  limit = PAGE_SIZE,
}: { page?: number; category?: string; query?: string; limit?: number } = {}) {
  const filters = [published];
  if (category) filters.push(eq(posts.category, category));
  if (query) {
    const q = `%${query.replace(/[%_]/g, "")}%`;
    filters.push(or(like(posts.title, q), like(posts.excerpt, q), like(posts.tags, q))!);
  }
  const where = and(...filters);

  const [rows, [{ total }]] = await Promise.all([
    db
      .select(cardColumns)
      .from(posts)
      .where(where)
      .orderBy(desc(posts.publishedAt))
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ total: count() }).from(posts).where(where),
  ]);

  return { posts: rows, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

export async function getFeaturedPost() {
  const [row] = await db
    .select(cardColumns)
    .from(posts)
    .where(and(published, eq(posts.featured, true)))
    .orderBy(desc(posts.publishedAt))
    .limit(1);
  return row ?? null;
}

export async function getPopularPosts(limit = 5) {
  return db
    .select(cardColumns)
    .from(posts)
    .where(published)
    .orderBy(desc(sql`(select count(*) from ${likes} where ${likes.postId} = ${posts.id})`), desc(posts.publishedAt))
    .limit(limit);
}

export async function getPostBySlug(slug: string) {
  const [row] = await db
    .select()
    .from(posts)
    .where(and(eq(posts.slug, slug), published))
    .limit(1);
  return row ?? null;
}

export async function getRelatedPosts(postId: string, category: string, limit = 3) {
  return db
    .select(cardColumns)
    .from(posts)
    .where(and(published, eq(posts.category, category), ne(posts.id, postId)))
    .orderBy(desc(posts.publishedAt))
    .limit(limit);
}

export async function getLikeState(postId: string, userId?: string) {
  const [[{ total }], mine] = await Promise.all([
    db.select({ total: count() }).from(likes).where(eq(likes.postId, postId)),
    userId
      ? db
          .select({ postId: likes.postId })
          .from(likes)
          .where(and(eq(likes.postId, postId), eq(likes.userId, userId)))
          .limit(1)
      : Promise.resolve([]),
  ]);
  return { count: total, liked: mine.length > 0 };
}

export async function getComments(postId: string) {
  return db
    .select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,
      userId: comments.userId,
      userName: user.name,
      userImage: user.image,
    })
    .from(comments)
    .innerJoin(user, eq(user.id, comments.userId))
    .where(eq(comments.postId, postId))
    .orderBy(desc(comments.createdAt));
}

export async function getCategoryCounts() {
  const rows = await db
    .select({ category: posts.category, total: count() })
    .from(posts)
    .where(published)
    .groupBy(posts.category);
  return Object.fromEntries(rows.map((r) => [r.category, r.total])) as Record<string, number>;
}

export async function getAllPublishedForSitemap() {
  return db
    .select({ slug: posts.slug, updatedAt: posts.updatedAt, category: posts.category })
    .from(posts)
    .where(published)
    .orderBy(desc(posts.publishedAt));
}

// ---- Admin ----
export async function getAllPostsForAdmin() {
  return db
    .select({
      ...cardColumns,
      published: posts.published,
      featured: posts.featured,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .orderBy(desc(posts.updatedAt));
}

export async function getPostById(id: string) {
  const [row] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  return row ?? null;
}

export async function getAdminStats() {
  const [[p], [l], [c], [u]] = await Promise.all([
    db.select({ n: count() }).from(posts),
    db.select({ n: count() }).from(likes),
    db.select({ n: count() }).from(comments),
    db.select({ n: count() }).from(user),
  ]);
  return { posts: p.n, likes: l.n, comments: c.n, users: u.n };
}
