# सनातन ब्लॉग्स — Sanatan Blogs

A fast, SEO-friendly, **bilingual (Hindi + English)** blog about Sanatan Dharma. It's built with **Next.js 16** (App Router), **Tailwind CSS 4**, **Better Auth** (Google login), **MongoDB** and **Cloudinary** (image uploads).

## Features

- 🌐 **Hindi + English**: Hindi is the default language at `/…`, and English lives at `/en/…`. The **हि | EN** switcher in the header keeps you on the same page. Articles have optional English translations (a Hindi/English tab in the editor). An untranslated article opens in English with a “Hindi only” note, and its canonical URL points to the Hindi original.
- ✍️ **Admin panel** (`/admin`) where you can write, edit, delete, draft and feature articles in Markdown, with a toolbar, live preview, SEO character counters and a Google-result preview
- 🖼️ **Image uploads to Cloudinary**: drag & drop a cover photo, or upload a photo straight into the article body. Replacing or deleting a post removes its image from Cloudinary too. Posts without a cover get an auto-generated gradient.
- 🔐 **Two ways to sign in**: Google in one click, or a normal email + password form. New email accounts are verified with a 6-digit OTP sent by mail, and "forgot password" uses the same OTP flow.
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
npm run db:seed                 # create indexes and add 6 sample articles (Hindi + English)
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

### MongoDB

Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas), then:

1. **Database Access** → create a user with a password.
2. **Network Access** → allow your IP (and your server's IP, or 0.0.0.0/0 for a quick start).
3. Copy the connection string into `MONGODB_URI`, with the database name in the path, e.g.
   `mongodb+srv://user:pass@cluster0.xxxx.mongodb.net/Sanatan-blogs2?retryWrites=true&w=majority`
4. Run `npm run db:seed` once to create indexes.

### Email (for OTP codes)

Pick one provider and fill in `.env.local`:

- **Resend** (simplest): create an account at [resend.com](https://resend.com), verify a domain, then set
  `RESEND_API_KEY` and `EMAIL_FROM`.
- **SMTP** (e.g. Gmail with an [app password](https://myaccount.google.com/apppasswords)): set `SMTP_HOST`,
  `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` and `EMAIL_FROM`.

With neither set, codes are **printed in the dev server terminal** so you can test sign-up locally. In
production the app refuses to send instead of silently dropping the mail.

### Cloudinary

Sign up at [cloudinary.com](https://cloudinary.com), open the Dashboard and copy **Cloud name**, **API Key**
and **API Secret** into the `CLOUDINARY_*` variables. Uploads go to the `sanatan-blogs/uploads` folder,
and only signed-in admins can upload (`/api/upload`).

## Deploying

Set every variable from `.env.example` on your host (Vercel, EC2, …) and point `NEXT_PUBLIC_SITE_URL` and
`BETTER_AUTH_URL` at your real domain. Nothing is stored on disk, so any host works. Run `npm run db:seed`
once against the production database.

After deploying, submit `https://your-domain.com/sitemap.xml` in
[Google Search Console](https://search.google.com/search-console) and put the verification token in
`GOOGLE_SITE_VERIFICATION`.

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
  api/upload/              Admin-only Cloudinary upload/delete endpoint
  sitemap.ts robots.ts feed.xml/ manifest.ts api/auth/
components/                UI components
lib/
  i18n.ts                  Locales, URL helpers and the Hindi/English UI dictionaries
  locale.ts                Server helpers: current locale, hreflang alternates
  auth.ts auth-client.ts   Better Auth (Google + email/password + OTP) and the admin check
  email.ts                 Sends the OTP mail via Resend or SMTP
  db.ts                    MongoDB client, collections and document types
  cloudinary.ts            Image upload/delete helpers
  posts.ts                 Data queries (aggregations with like/comment counts)
  site.ts                  Site config + categories
scripts/setup-db.mjs       Creates indexes / seeds sample posts
```
