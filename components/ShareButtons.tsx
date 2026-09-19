"use client";

import { useState } from "react";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links = [
    { name: "WhatsApp", href: `https://wa.me/?text=${t}%20${u}`, bg: "bg-[#25D366]", label: "WA" },
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, bg: "bg-[#1877F2]", label: "f" },
    { name: "X", href: `https://x.com/intent/tweet?url=${u}&text=${t}`, bg: "bg-black", label: "𝕏" },
    { name: "Telegram", href: `https://t.me/share/url?url=${u}&text=${t}`, bg: "bg-[#229ED9]", label: "✈" },
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
      <span className="mr-1 text-sm font-semibold text-muted">साझा करें:</span>
      {links.map((l) => (
        <a
          key={l.name}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${l.name} पर साझा करें`}
          className={`grid size-9 place-items-center rounded-full text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-md ${l.bg}`}
        >
          {l.label}
        </a>
      ))}
      <button
        type="button"
        onClick={copy}
        className="rounded-full border border-line px-3 py-1.5 text-sm font-semibold hover:border-saffron hover:text-saffron"
      >
        {copied ? "✓ कॉपी हो गया" : "🔗 लिंक"}
      </button>
    </div>
  );
}
