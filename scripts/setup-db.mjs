// Creates all tables (idempotent) and optionally seeds sample articles.
// Usage: node --env-file-if-exists=.env.local scripts/setup-db.mjs [--seed]
import { createClient } from "@libsql/client";
import { mkdirSync } from "node:fs";
import { seedPosts } from "./seed-posts.mjs";

const url = process.env.DATABASE_URL ?? "file:./data/sanatan.db";
if (url.startsWith("file:")) mkdirSync("./data", { recursive: true });

const db = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN || undefined });

const statements = [
  `PRAGMA foreign_keys = ON`,
  `CREATE TABLE IF NOT EXISTS user (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    email_verified INTEGER NOT NULL DEFAULT 0,
    image TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS session (
    id TEXT PRIMARY KEY,
    expires_at INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS session_user_idx ON session(user_id)`,
  `CREATE TABLE IF NOT EXISTS account (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    access_token TEXT,
    refresh_token TEXT,
    id_token TEXT,
    access_token_expires_at INTEGER,
    refresh_token_expires_at INTEGER,
    scope TEXT,
    password TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS account_user_idx ON account(user_id)`,
  `CREATE TABLE IF NOT EXISTS verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER,
    updated_at INTEGER
  )`,
  `CREATE INDEX IF NOT EXISTS verification_identifier_idx ON verification(identifier)`,
  `CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    cover_image TEXT,
    category TEXT NOT NULL,
    tags TEXT NOT NULL DEFAULT '',
    author_id TEXT REFERENCES user(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    published INTEGER NOT NULL DEFAULT 0,
    featured INTEGER NOT NULL DEFAULT 0,
    reading_time INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    published_at INTEGER
  )`,
  `CREATE INDEX IF NOT EXISTS posts_category_idx ON posts(category)`,
  `CREATE INDEX IF NOT EXISTS posts_published_idx ON posts(published, published_at)`,
  `CREATE TABLE IF NOT EXISTS likes (
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL,
    PRIMARY KEY (post_id, user_id)
  )`,
  `CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS comments_post_idx ON comments(post_id, created_at)`,
];

await db.batch(statements, "write");
console.log("✔ Tables ready");

if (process.argv.includes("--seed")) {
  const day = 24 * 60 * 60 * 1000;
  let inserted = 0;
  for (const [i, p] of seedPosts.entries()) {
    const ts = Date.now() - (i + 1) * 3 * day;
    const words = p.content.split(/\s+/).filter(Boolean).length;
    const res = await db.execute({
      sql: `INSERT OR IGNORE INTO posts
        (id, slug, title, excerpt, content, cover_image, category, tags, author_id, author_name,
         published, featured, reading_time, created_at, updated_at, published_at)
        VALUES (?, ?, ?, ?, ?, NULL, ?, ?, NULL, ?, 1, ?, ?, ?, ?, ?)`,
      args: [
        crypto.randomUUID(), p.slug, p.title, p.excerpt, p.content.trim(), p.category, p.tags,
        "Sanatan Blogs Team", i === 0 ? 1 : 0, Math.max(1, Math.round(words / 200)), ts, ts, ts,
      ],
    });
    inserted += res.rowsAffected;
  }
  console.log(`✔ Seeded ${inserted} sample article(s)`);
}

db.close();
