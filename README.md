# सनातन ब्लॉग्स — Sanatan Blogs

A fast, SEO-friendly, **bilingual (Hindi + English)** blog about Sanatan Dharma. It's built with **Next.js 16** (App Router), **Tailwind CSS 4**, **Better Auth** (Google login) and **Drizzle ORM + SQLite/Turso**.

## Features

- 🌐 **Hindi + English**: Hindi is the default language at `/…`, and English lives at `/en/…`. The **हि | EN** switcher in the header keeps you on the same page. Articles have optional English translations (a Hindi/English tab in the editor). An untranslated article opens in English with a “Hindi only” note, and its canonical URL points to the Hindi original.
- ✍️ **Admin panel** (`/admin`) where you can write, edit, delete, draft and feature articles in Markdown, with a toolbar, live preview, SEO character counters and a Google-result preview
- 🔐 **Google sign-in**: readers log in with one click
- 🙏 **Likes** (optimistic UI) and 💬 **comments** (users can delete their own comments; admins can delete any)
- 🔍 Search, categories, pagination, related posts, table of contents and share buttons (WhatsApp, Facebook, X, Telegram)
- 🌗 Light/dark theme, Devanagari fonts (Mukta and Noto Serif Devanagari), mobile-first layout
- 📈 **SEO**
  - Per-page `<title>`, meta description, canonical URL, Open Graph and Twitter cards
  - A generated OG image for every article
  - JSON-LD: `WebSite` + `SearchAction`, `Organization`, `BlogPosting` (with like/comment counts and comments) and `BreadcrumbList`
  - `sitemap.xml`, `robots.txt`, `feed.xml` (RSS) and a web manifest
  - `hreflang` alternates (hi-IN / en-IN / x-default) on every page and in the sitemap, a localized `<html lang>`, and `og:locale`
  - Server-rendered HTML with ISR and semantic markup
  - Search pages, `/login` and `/admin` are `noindex`

## Setup

```bash
npm install
cp .env.example .env.local      # then fill in the values
npm run db:seed                 # create/migrate tables and add 6 sample articles (Hindi + English)
npm run dev
```

### Google OAuth

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials) and create an **OAuth client ID** (Web application).
2. Add these values:
   - **Authorized JavaScript origin:** `http://localhost:3000` (and your production domain)
   - **Authorized redirect URI:** `http://localhost:3000/api/auth/callback/google` (and `https://your-domain.com/api/auth/callback/google`)
3. Put the client ID and secret in `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

### Admin access

Put your Google email(s) in `ADMIN_EMAILS` (comma-separated). After you log in with that account, the user menu shows **Admin Dashboard** and **नया लेख लिखें**.

## Deploying (e.g. Vercel)

A SQLite file does not persist on serverless hosts, so use [Turso](https://turso.tech) (hosted libSQL, free tier):

```bash
turso db create sanatan-blogs
turso db show sanatan-blogs --url        # -> DATABASE_URL (libsql://...)
turso db tokens create sanatan-blogs     # -> DATABASE_AUTH_TOKEN
DATABASE_URL=... DATABASE_AUTH_TOKEN=... npm run db:setup
```

Set every variable from `.env.example` in your host. Point `NEXT_PUBLIC_SITE_URL` and `BETTER_AUTH_URL` at your real domain. After deploying, submit `https://your-domain.com/sitemap.xml` in [Google Search Console](https://search.google.com/search-console). Put the site verification token in `GOOGLE_SITE_VERIFICATION`.

## Project structure

```
proxy.ts                   Locale routing: /x → Hindi (rewrite to /hi/x), /en/x → English, /hi/x → 308 to /x
app/[lang]/
  layout.tsx               Root layout (html lang, fonts, header/footer, hreflang)
  page.tsx                 Home (hero, featured, categories, latest, popular)
  blog/page.tsx            All articles + search + pagination
  blog/[slug]/             Article page, OG image
  category/                Category index + category pages
  admin/                   Dashboard, new/edit editor (admin only)
  opengraph-image.tsx      Default share image
app/
  actions.ts               Server actions: like, comment, save/delete post
  sitemap.ts robots.ts feed.xml/ manifest.ts api/auth/
components/                UI components
lib/
  i18n.ts                  Locales, URL helpers and the Hindi/English UI dictionaries
  locale.ts                Server helpers: current locale, hreflang alternates
  auth.ts auth-client.ts   Better Auth (Google) + admin check
  db/                      Drizzle schema + client
  posts.ts                 Data queries
  site.ts                  Site config + categories
scripts/setup-db.mjs       Creates tables / seeds sample posts
```
