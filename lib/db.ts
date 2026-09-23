import "server-only";
import { MongoClient, ObjectId, type Collection, type Db } from "mongodb";

// ---------- Document shapes ----------
export type PostDoc = {
  _id: ObjectId;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  /** Optional English translation */
  titleEn: string | null;
  excerptEn: string | null;
  contentEn: string | null;
  coverImage: string | null;
  /** Cloudinary public_id, so the image can be deleted with the post */
  coverImageId: string | null;
  category: string;
  tags: string;
  authorId: string | null;
  authorName: string;
  published: boolean;
  featured: boolean;
  readingTime: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
};

export type LikeDoc = { _id: ObjectId; postId: ObjectId; userId: string; createdAt: Date };

export type CommentDoc = {
  _id: ObjectId;
  postId: ObjectId;
  userId: string;
  content: string;
  createdAt: Date;
};

/** Better Auth's user collection (it owns the schema; these are the fields we read). */
export type UserDoc = { _id: ObjectId; name: string; email: string; image?: string | null };

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is not set — copy .env.example to .env.local and fill it in.");

// Reuse one client across hot reloads in dev and across lambda invocations in production
const globalForMongo = globalThis as unknown as { mongoClient?: MongoClient; mongoPromise?: Promise<MongoClient> };

const client = globalForMongo.mongoClient ?? new MongoClient(uri, { maxPoolSize: 10 });
const clientPromise = globalForMongo.mongoPromise ?? client.connect();

if (process.env.NODE_ENV !== "production") {
  globalForMongo.mongoClient = client;
  globalForMongo.mongoPromise = clientPromise;
}

export { client as mongoClient, clientPromise };

/** The database named in MONGODB_URI. */
export const db: Db = client.db();

export const posts = db.collection<PostDoc>("posts");
export const likes = db.collection<LikeDoc>("likes");
export const comments = db.collection<CommentDoc>("comments");
export const users: Collection<UserDoc> = db.collection<UserDoc>("user");

/** Safely turns a string into an ObjectId (returns null when the id is malformed). */
export function toObjectId(id: string): ObjectId | null {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

export { ObjectId };
