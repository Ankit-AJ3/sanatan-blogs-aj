import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

// Satori (the OG renderer) can't shape Devanagari conjuncts/matras correctly, so the
// generated image only renders Latin text plus the ॐ glyph. The Hindi title still
// appears on social cards through og:title.
const hasDevanagari = (s: string) => /[ऀ-ॿ]/.test(s);

async function fonts() {
  const dir = join(process.cwd(), "assets/fonts");
  const [deva, latin] = await Promise.all([
    readFile(join(dir, "mukta-devanagari-700-normal.woff")),
    readFile(join(dir, "mukta-latin-700-normal.woff")),
  ]);
  return [
    { name: "Mukta", data: latin, weight: 700 as const, style: "normal" as const },
    { name: "Mukta", data: deva, weight: 700 as const, style: "normal" as const },
  ];
}

export async function renderOg({
  heading,
  fallbackHeading = "Sanatan Blogs",
  subheading,
  gradient = ["#d9631a", "#7a1f1f"],
}: {
  heading: string;
  /** Shown instead of heading when heading contains Devanagari */
  fallbackHeading?: string;
  subheading: string;
  gradient?: [string, string];
}) {
  const title = hasDevanagari(heading) ? fallbackHeading : heading;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 64,
          padding: "0 90px",
          color: "#fff",
          fontFamily: "Mukta",
          background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
        }}
      >
        <div
          style={{
            width: 300,
            height: 300,
            flexShrink: 0,
            borderRadius: 999,
            border: "6px solid rgba(255,255,255,0.35)",
            background: "rgba(255,255,255,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 190,
            lineHeight: 1,
          }}
        >
          ॐ
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 680 }}>
          <div style={{ fontSize: 28, letterSpacing: 8, opacity: 0.85 }}>SANATAN BLOGS</div>
          <div style={{ fontSize: title.length > 40 ? 58 : 76, lineHeight: 1.1 }}>{title}</div>
          <div style={{ width: 120, height: 5, borderRadius: 9, background: "#f6c667" }} />
          <div style={{ fontSize: 32, opacity: 0.9 }}>{hasDevanagari(subheading) ? "" : subheading}</div>
        </div>
      </div>
    ),
    { ...ogSize, fonts: await fonts() },
  );
}
