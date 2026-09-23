import "server-only";
import { cache } from "react";
import { ObjectId, comments, likes, posts, toObjectId, users, type PostDoc } from "@/lib/db";

export const PAGE_SIZE = 9;

/** Post fields needed by cards/listings, with like and comment counts. */
export type PostCardData = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  titleEn: string | null;
  excerptEn: string | null;
  coverImage: string | null;
  category: string;
  authorName: string;
  readingTime: number;
  publishedAt: Date | null;
  likeCount: number;
  commentCount: number;
};

/** Post as pages consume it: `_id` replaced by a string `id`. */
export type Post = Omit<PostDoc, "_id"> & { id: string };

const publishedFilter = { published: true } as const;

const cardProjection = {
  slug: 1,
  title: 1,
  excerpt: 1,
  titleEn: 1,
  excerptEn: 1,
  coverImage: 1,
  category: 1,
  authorName: 1,
  readingTime: 1,
  publishedAt: 1,
  published: 1,
  featured: 1,
  updatedAt: 1,
} as const;

/** Adds likeCount / commentCount to each document in an aggregation. */
const countStages = [
  {
    $lookup: {
      from: "likes",
      localField: "_id",
      foreignField: "postId",
      as: "likeDocs",
      pipeline: [{ $project: { _id: 1 } }],
    },
  },
  {
    $lookup: {
      from: "comments",
      localField: "_id",
      foreignField: "postId",
      as: "commentDocs",
      pipeline: [{ $project: { _id: 1 } }],
    },
  },
  {
    $addFields: {
      id: { $toString: "$_id" },
      likeCount: { $size: "$likeDocs" },
      commentCount: { $size: "$commentDocs" },
    },
  },
  { $project: { _id: 0, likeDocs: 0, commentDocs: 0 } },
];

async function cards(match: object, sort: object, limit: number, skip = 0) {
  return posts
    .aggregate<PostCardData>([
      { $match: match },
      { $sort: sort as Record<string, 1 | -1> },
      { $skip: skip },
      { $limit: limit },
      { $project: cardProjection },
      ...countStages,
    ])
    .toArray();
}

function searchFilter(query: string) {
  // Escape regex characters so a user's search text is treated literally
  const safe = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const rx = { $regex: safe, $options: "i" };
  return { $or: [{ title: rx }, { excerpt: rx }, { tags: rx }, { titleEn: rx }, { excerptEn: rx }] };
}

export async function getPublishedPosts({
  page = 1,
  category,
  query,
  limit = PAGE_SIZE,
}: { page?: number; category?: string; query?: string; limit?: number } = {}) {
  const match: Record<string, unknown> = { ...publishedFilter };
  if (category) match.category = category;
  if (query) Object.assign(match, searchFilter(query));

  const [rows, total] = await Promise.all([
    cards(match, { publishedAt: -1 }, limit, (page - 1) * limit),
    posts.countDocuments(match),
  ]);

  return { posts: rows, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

export async function getFeaturedPost() {
  const [row] = await cards({ ...publishedFilter, featured: true }, { publishedAt: -1 }, 1);
  return row ?? null;
}

export async function getPopularPosts(limit = 5) {
  return posts
    .aggregate<PostCardData>([
      { $match: publishedFilter },
      { $project: cardProjection },
      ...countStages,
      { $sort: { likeCount: -1, publishedAt: -1 } },
      { $limit: limit },
    ])
    .toArray();
}

const toPost = (doc: PostDoc): Post => {
  const { _id, ...rest } = doc;
  return { ...rest, id: _id.toString() };
};

export const getPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  const doc = await posts.findOne({ slug, ...publishedFilter });
  return doc ? toPost(doc) : null;
});

export async function getRelatedPosts(postId: string, category: string, limit = 3) {
  const id = toObjectId(postId);
  return cards({ ...publishedFilter, category, _id: { $ne: id } }, { publishedAt: -1 }, limit);
}

export async function getLikeState(postId: string, userId?: string) {
  const id = toObjectId(postId);
  if (!id) return { count: 0, liked: false };
  const [count, mine] = await Promise.all([
    likes.countDocuments({ postId: id }),
    userId ? likes.findOne({ postId: id, userId }) : Promise.resolve(null),
  ]);
  return { count, liked: !!mine };
}

export type CommentWithUser = {
  id: string;
  content: string;
  createdAt: Date;
  userId: string;
  userName: string;
  userImage: string | null;
};

export async function getComments(postId: string): Promise<CommentWithUser[]> {
  const id = toObjectId(postId);
  if (!id) return [];
  const rows = await comments.find({ postId: id }).sort({ createdAt: -1 }).toArray();
  if (!rows.length) return [];

  const userIds = [...new Set(rows.map((r) => r.userId))].map(toObjectId).filter(Boolean) as ObjectId[];
  const authors = await users.find({ _id: { $in: userIds } }).toArray();
  const byId = new Map(authors.map((u) => [u._id.toString(), u]));

  return rows.map((r) => {
    const u = byId.get(r.userId);
    return {
      id: r._id.toString(),
      content: r.content,
      createdAt: r.createdAt,
      userId: r.userId,
      userName: u?.name ?? "User",
      userImage: u?.image ?? null,
    };
  });
}

export async function getCategoryCounts() {
  const rows = await posts
    .aggregate<{ _id: string; total: number }>([{ $match: publishedFilter }, { $group: { _id: "$category", total: { $sum: 1 } } }])
    .toArray();
  return Object.fromEntries(rows.map((r) => [r._id, r.total])) as Record<string, number>;
}

export async function getAllPublishedForSitemap() {
  return posts
    .find(publishedFilter, { projection: { slug: 1, updatedAt: 1, category: 1, titleEn: 1, _id: 0 } })
    .sort({ publishedAt: -1 })
    .toArray() as Promise<{ slug: string; updatedAt: Date; category: string; titleEn: string | null }[]>;
}

// ---- Admin ----
export type AdminPostRow = PostCardData & { published: boolean; featured: boolean; updatedAt: Date };

export async function getAllPostsForAdmin() {
  return posts
    .aggregate<AdminPostRow>([{ $sort: { updatedAt: -1 } }, { $project: cardProjection }, ...countStages])
    .toArray();
}

export async function getPostById(id: string): Promise<Post | null> {
  const _id = toObjectId(id);
  if (!_id) return null;
  const doc = await posts.findOne({ _id });
  return doc ? toPost(doc) : null;
}

export async function getAdminStats() {
  const [p, l, c, u] = await Promise.all([
    posts.countDocuments(),
    likes.countDocuments(),
    comments.countDocuments(),
    users.countDocuments(),
  ]);
  return { posts: p, likes: l, comments: c, users: u };
}
