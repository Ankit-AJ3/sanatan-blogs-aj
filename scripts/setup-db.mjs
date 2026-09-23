// Creates MongoDB indexes (idempotent) and optionally seeds sample articles.
// Usage: node --env-file-if-exists=.env.local scripts/setup-db.mjs [--seed]
import { MongoClient } from "mongodb";
import { seedPosts } from "./seed-posts.mjs";
import { seedPostsEn } from "./seed-posts-en.mjs";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set. Copy .env.example to .env.local and fill it in.");
  process.exit(1);
}

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 20000 });
await client.connect();
const db = client.db();
console.log(`Connected to database "${db.databaseName}"`);

await Promise.all([
  db.collection("posts").createIndexes([
    { key: { slug: 1 }, unique: true, name: "slug_unique" },
    { key: { published: 1, publishedAt: -1 }, name: "published_recent" },
    { key: { category: 1, publishedAt: -1 }, name: "category_recent" },
    { key: { featured: 1 }, name: "featured" },
  ]),
  // One like per user per post
  db.collection("likes").createIndexes([
    { key: { postId: 1, userId: 1 }, unique: true, name: "post_user_unique" },
    { key: { postId: 1 }, name: "post" },
  ]),
  db.collection("comments").createIndexes([{ key: { postId: 1, createdAt: -1 }, name: "post_recent" }]),
  // Better Auth collections
  db.collection("user").createIndexes([{ key: { email: 1 }, unique: true, name: "email_unique" }]),
  db.collection("session").createIndexes([{ key: { token: 1 }, unique: true, name: "token_unique" }]),
  db.collection("account").createIndexes([{ key: { userId: 1 }, name: "user" }]),
]);
console.log("Indexes ready");

if (process.argv.includes("--seed")) {
  const day = 24 * 60 * 60 * 1000;
  let inserted = 0;
  for (const [i, p] of seedPosts.entries()) {
    if (await db.collection("posts").findOne({ slug: p.slug }, { projection: { _id: 1 } })) continue;
    const ts = new Date(Date.now() - (i + 1) * 3 * day);
    const en = seedPostsEn[p.slug] ?? null;
    const words = p.content.split(/\s+/).filter(Boolean).length;
    await db.collection("posts").insertOne({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      content: p.content.trim(),
      titleEn: en?.title ?? null,
      excerptEn: en?.excerpt ?? null,
      contentEn: en?.content.trim() ?? null,
      coverImage: null,
      coverImageId: null,
      category: p.category,
      tags: p.tags,
      authorId: null,
      authorName: "Sanatan Blogs Team",
      published: true,
      featured: i === 0,
      readingTime: Math.max(1, Math.round(words / 200)),
      createdAt: ts,
      updatedAt: ts,
      publishedAt: ts,
    });
    inserted++;
  }
  console.log(`Seeded ${inserted} sample article(s)`);
}

await client.close();
