"use client";

import { useState } from "react";
import { CheckIcon, ShareIcon, shareIcons } from "./icons";
import { useLocale } from "./LocaleProvider";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const tt = encodeURIComponent(title);
  const links = [
    { name: "WhatsApp", href: `https://wa.me/?text=${tt}%20${u}`, bg: "bg-[#25D366]", Icon: shareIcons.whatsapp },
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, bg: "bg-[#1877F2]", Icon: shareIcons.facebook },
    { name: "X", href: `https://x.com/intent/tweet?url=${u}&text=${tt}`, bg: "bg-black", Icon: shareIcons.x },
    { name: "Telegram", href: `https://t.me/share/url?url=${u}&text=${tt}`, bg: "bg-[#229ED9]", Icon: shareIcons.telegram },
  ];

  async function copy() {
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm font-semibold text-muted">{t.post.share}</span>
      {links.map(({ name, href, bg, Icon }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t.post.shareOn(name)}
          className={`grid size-9 place-items-center rounded-full text-white transition hover:-translate-y-0.5 hover:shadow-md ${bg}`}
        >
          <Icon className="size-4" aria-hidden />
        </a>
      ))}
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm font-semibold hover:border-saffron hover:text-saffron"
      >
        {copied ? <CheckIcon className="size-4" aria-hidden /> : <ShareIcon className="size-4" aria-hidden />}
        {copied ? t.post.copied : t.post.copyLink}
      </button>
    </div>
  );
}
