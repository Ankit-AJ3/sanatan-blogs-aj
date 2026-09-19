"use client";

/**
 * Inline script that runs during HTML parsing (before paint) on full page loads.
 * On the client it renders as inert text/plain, so React doesn't warn about script tags.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
