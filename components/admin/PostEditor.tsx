"use client";

import { useActionState, useRef, useState } from "react";
import { savePost, type PostFormState } from "@/app/actions";
import {
  BoldIcon,
  CheckIcon,
  Heading2Icon,
  Heading3Icon,
  ImageUploadIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  OrderedListIcon,
  PreviewIcon,
  PublishIcon,
  QuoteIcon,
  SaveIcon,
  SearchIcon,
  WriteIcon,
  type IconType,
} from "@/components/icons";
import { useLocale } from "@/components/LocaleProvider";
import { Markdown } from "@/components/Markdown";
import { ImageUpload, uploadToCloudinary } from "./ImageUpload";
import type { Post } from "@/lib/posts";
import type { Locale } from "@/lib/i18n";
import { categories, categoryText } from "@/lib/site";
import { slugify } from "@/lib/utils";

const input =
  "w-full rounded-xl border border-line bg-bg px-4 py-2.5 outline-none transition focus:border-saffron focus:ring-2 focus:ring-saffron/20";

const toolbar: { Icon: IconType; title: string; before: string; after?: string; block?: boolean }[] = [
  { Icon: Heading2Icon, title: "Heading", before: "## ", block: true },
  { Icon: Heading3Icon, title: "Sub-heading", before: "### ", block: true },
  { Icon: BoldIcon, title: "Bold", before: "**", after: "**" },
  { Icon: ItalicIcon, title: "Italic", before: "*", after: "*" },
  { Icon: QuoteIcon, title: "Quote / Shloka", before: "> ", block: true },
  { Icon: ListIcon, title: "List", before: "- ", block: true },
  { Icon: OrderedListIcon, title: "Numbered list", before: "1. ", block: true },
  { Icon: LinkIcon, title: "Link", before: "[", after: "](https://)" },
];

type Fields = { title: string; excerpt: string; content: string };

export function PostEditor({ post }: { post?: Post }) {
  const { lang, t } = useLocale();
  const [state, action, pending] = useActionState<PostFormState, FormData>(savePost, {});
  const [fields, setFields] = useState<Record<Locale, Fields>>({
    hi: { title: post?.title ?? "", excerpt: post?.excerpt ?? "", content: post?.content ?? "" },
    en: { title: post?.titleEn ?? "", excerpt: post?.excerptEn ?? "", content: post?.contentEn ?? "" },
  });
  const [contentLang, setContentLang] = useState<Locale>("hi");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!post);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [cover, setCover] = useState({ url: post?.coverImage ?? null, publicId: post?.coverImageId ?? null });
  const [inserting, setInserting] = useState(false);
  const imageInput = useRef<HTMLInputElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);

  const cur = fields[contentLang];
  const set = (key: keyof Fields, value: string) =>
    setFields((f) => ({ ...f, [contentLang]: { ...f[contentLang], [key]: value } }));

  function applyFormat(tb: (typeof toolbar)[number]) {
    const el = textarea.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e, value } = el;
    const selected = value.slice(s, e);
    const prefix = tb.block && s > 0 && value[s - 1] !== "\n" ? `\n${tb.before}` : tb.before;
    set("content", value.slice(0, s) + prefix + selected + (tb.after ?? "") + value.slice(e));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + prefix.length, s + prefix.length + selected.length);
    });
  }

  function insertAtCursor(markdown: string) {
    const el = textarea.current;
    const value = el?.value ?? cur.content;
    const at = el?.selectionStart ?? value.length;
    const gap = at > 0 && value[at - 1] !== "\n" ? "\n\n" : "";
    set("content", `${value.slice(0, at)}${gap}${markdown}\n\n${value.slice(at)}`);
    requestAnimationFrame(() => el?.focus());
  }

  /** Uploads a photo and drops it into the article at the cursor. */
  async function insertImage(file: File | undefined) {
    if (!file) return;
    setInserting(true);
    try {
      const image = await uploadToCloudinary(file);
      insertAtCursor(`![${file.name.replace(/\.[^.]+$/, "")}](${image.url})`);
    } catch {
      alert(t.editor.upload.errors.upload_failed);
    } finally {
      setInserting(false);
    }
  }

  // English slugs rank better, so prefer the English title when auto-generating
  const autoSlugSource = fields.en.title || fields.hi.title;
  const effectiveSlug = slugTouched ? slug : autoSlugSource ? slugify(autoSlugSource) : "";
  const isEn = contentLang === "en";
  const errorText = state.error ? t.editor.errors[state.error] : null;

  return (
    <form action={action} className="grid gap-8 lg:grid-cols-[1fr_320px]">
      {post && <input type="hidden" name="id" value={post.id} />}
      <input type="hidden" name="lang" value={lang} />
      {/* Both languages are always submitted; only the active tab is editable on screen */}
      <input type="hidden" name="title" value={fields.hi.title} />
      <input type="hidden" name="excerpt" value={fields.hi.excerpt} />
      <input type="hidden" name="content" value={fields.hi.content} />
      <input type="hidden" name="titleEn" value={fields.en.title} />
      <input type="hidden" name="excerptEn" value={fields.en.excerpt} />
      <input type="hidden" name="contentEn" value={fields.en.content} />

      <div className="space-y-5">
        <div role="tablist" aria-label="Content language" className="flex w-fit rounded-full border border-line bg-surface p-1">
          {(["hi", "en"] as const).map((l) => (
            <button
              key={l}
              type="button"
              role="tab"
              aria-selected={contentLang === l}
              onClick={() => setContentLang(l)}
              className={`flex items-center gap-2 rounded-full px-5 py-2 font-semibold transition ${
                contentLang === l ? "bg-gradient-to-r from-saffron to-maroon text-white shadow" : "text-muted"
              }`}
            >
              {l === "hi" ? t.editor.hindiTab : t.editor.englishTab}
              {fields[l].title && fields[l].content ? <CheckIcon className="size-4" aria-hidden /> : null}
            </button>
          ))}
        </div>
        {isEn && <p className="rounded-xl bg-saffron-soft px-4 py-2 text-sm">{t.editor.englishOptional}</p>}

        <div>
          <label htmlFor="f-title" className="mb-1.5 block font-semibold">
            {isEn ? t.editor.titleEn : t.editor.title}
          </label>
          <input
            id="f-title"
            lang={contentLang}
            required={!isEn}
            value={cur.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder={isEn ? "e.g. Karma Yoga in the Bhagavad Gita" : t.editor.titlePlaceholder}
            className={`${input} font-serif text-xl`}
          />
          <p className={`mt-1 text-xs ${cur.title.length > 65 ? "text-amber-600" : "text-muted"}`}>
            {t.editor.titleHint(cur.title.length)}
          </p>
        </div>

        <div>
          <label htmlFor="f-excerpt" className="mb-1.5 block font-semibold">
            {isEn ? t.editor.excerptEn : t.editor.excerpt}
          </label>
          <textarea
            id="f-excerpt"
            lang={contentLang}
            required={!isEn}
            rows={3}
            value={cur.excerpt}
            onChange={(e) => set("excerpt", e.target.value)}
            placeholder={t.editor.excerptPlaceholder}
            className={input}
          />
          <p className={`mt-1 text-xs ${cur.excerpt.length > 160 ? "text-amber-600" : "text-muted"}`}>
            {t.editor.excerptHint(cur.excerpt.length)}
          </p>
        </div>

        <div>
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="f-content" className="font-semibold">
              {isEn ? t.editor.contentEn : t.editor.content}
            </label>
            <div className="flex rounded-full border border-line p-0.5 text-sm">
              {(["write", "preview"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setTab(v)}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-1 font-semibold ${
                    tab === v ? "bg-saffron text-white" : "text-muted"
                  }`}
                >
                  {v === "write" ? <WriteIcon className="size-4" aria-hidden /> : <PreviewIcon className="size-4" aria-hidden />}
                  {v === "write" ? t.editor.write : t.editor.preview}
                </button>
              ))}
            </div>
          </div>
          <div className={tab === "write" ? "" : "hidden"}>
            <div className="flex flex-wrap gap-1 rounded-t-xl border border-b-0 border-line bg-surface-2 p-1.5">
              {toolbar.map((tb) => (
                <button
                  key={tb.title}
                  type="button"
                  title={tb.title}
                  aria-label={tb.title}
                  onClick={() => applyFormat(tb)}
                  className="grid size-8 place-items-center rounded-lg hover:bg-surface"
                >
                  <tb.Icon className="size-4" aria-hidden />
                </button>
              ))}
              <span className="mx-1 w-px bg-line" aria-hidden />
              <button
                type="button"
                onClick={() => imageInput.current?.click()}
                disabled={inserting}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold hover:bg-surface disabled:opacity-60"
              >
                <ImageUploadIcon className="size-4" aria-hidden />
                {inserting ? t.editor.upload.uploading : t.editor.upload.insert}
              </button>
              <input
                ref={imageInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(ev) => {
                  insertImage(ev.target.files?.[0]);
                  ev.target.value = "";
                }}
              />
            </div>
            <textarea
              ref={textarea}
              id="f-content"
              lang={contentLang}
              required={!isEn}
              rows={22}
              value={cur.content}
              onChange={(e) => set("content", e.target.value)}
              placeholder={
                isEn
                  ? "## Introduction\n\nWrite your article here…\n\n> A shloka or quote\n\n- Point 1\n- Point 2"
                  : "## भूमिका\n\nयहाँ अपना लेख लिखें…\n\n> श्लोक या उद्धरण\n\n- बिंदु 1\n- बिंदु 2"
              }
              className={`${input} rounded-t-none font-mono text-[15px] leading-relaxed`}
            />
          </div>
          {tab === "preview" && (
            <div lang={contentLang} className="article-content min-h-[400px] rounded-xl border border-line bg-surface p-6">
              {cur.content ? <Markdown content={cur.content} /> : <p className="text-muted">{t.editor.previewEmpty}</p>}
            </div>
          )}
          <p className="mt-1 text-xs text-muted">{t.editor.words(cur.content.split(/\s+/).filter(Boolean).length)}</p>
        </div>
      </div>

      <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
        <div className="space-y-4 rounded-2xl border border-line bg-surface p-5">
          <label className="flex items-center justify-between gap-3 font-semibold">
            {t.editor.publish}
            <input type="checkbox" name="published" defaultChecked={post?.published ?? true} className="size-5 accent-saffron" />
          </label>
          <label className="flex items-center justify-between gap-3 font-semibold">
            {t.editor.featured}
            <input type="checkbox" name="featured" defaultChecked={post?.featured ?? false} className="size-5 accent-saffron" />
          </label>
          {errorText && (
            <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {errorText}
              {state.slug && <code className="ml-1">({state.slug})</code>}
            </p>
          )}
          <button
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-saffron to-maroon py-3 font-semibold text-white shadow-md transition hover:brightness-110 disabled:opacity-60"
          >
            {post ? <SaveIcon className="size-4" aria-hidden /> : <PublishIcon className="size-4" aria-hidden />}
            {pending ? t.editor.saving : post ? t.editor.update : t.editor.save}
          </button>
        </div>

        <div className="space-y-4 rounded-2xl border border-line bg-surface p-5">
          <div>
            <label htmlFor="category" className="mb-1.5 block font-semibold">
              {t.editor.category}
            </label>
            <select id="category" name="category" required defaultValue={post?.category ?? ""} className={input}>
              <option value="" disabled>
                {t.editor.choose}
              </option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {categoryText(c, lang).name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="slug" className="mb-1.5 block font-semibold">
              {t.editor.slug}
            </label>
            <input
              id="slug"
              name="slug"
              value={effectiveSlug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              placeholder="bhagavad-gita-karma-yoga"
              className={`${input} text-sm`}
            />
            <p className="mt-1 text-xs text-muted">{t.editor.slugHint}</p>
          </div>
          <div>
            <label htmlFor="tags" className="mb-1.5 block font-semibold">
              {t.editor.tags}
            </label>
            <input
              id="tags"
              name="tags"
              defaultValue={post?.tags ?? ""}
              placeholder="गीता, कर्मयोग, Krishna"
              className={`${input} text-sm`}
            />
            <p className="mt-1 text-xs text-muted">{t.editor.tagsHint}</p>
          </div>
          <div>
            <p className="mb-1.5 font-semibold">{t.editor.cover}</p>
            <input type="hidden" name="coverImage" value={cover.url ?? ""} />
            <input type="hidden" name="coverImageId" value={cover.publicId ?? ""} />
            <ImageUpload value={cover.url} publicId={cover.publicId} onChange={setCover} />
            <p className="mt-1 text-xs text-muted">{t.editor.coverHint}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-5 text-sm">
          <p className="mb-2 flex items-center gap-1.5 font-semibold">
            <SearchIcon className="size-4" aria-hidden />
            {t.editor.googlePreview}
          </p>
          <p className="truncate text-xs text-green-700">
            sanatanblogs › {isEn ? "en › " : ""}blog › {effectiveSlug || "…"}
          </p>
          <p lang={contentLang} className="line-clamp-1 text-base text-[#1a0dab] dark:text-[#8ab4f8]">
            {cur.title || (isEn ? "Article title" : "लेख का शीर्षक")}
          </p>
          <p lang={contentLang} className="line-clamp-2 text-muted">
            {cur.excerpt || (isEn ? "The article summary will appear here…" : "लेख का सारांश यहाँ दिखेगा…")}
          </p>
        </div>
      </aside>
    </form>
  );
}
