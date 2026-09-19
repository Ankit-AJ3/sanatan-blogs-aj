import { NextResponse, type NextRequest } from "next/server";

// Keep in sync with lib/i18n.ts (proxy should not import app modules)
const DEFAULT = "hi";
const COOKIE = "lang";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // English lives under /en — serve as-is
  if (pathname === "/en" || pathname.startsWith("/en/")) return NextResponse.next();

  // Hindi is the default and has no prefix: /hi/x -> /x (single canonical URL)
  // (Generated OG images are referenced at /hi/.../opengraph-image, so serve those directly.)
  if (pathname.startsWith("/hi/") && pathname.endsWith("/opengraph-image")) return NextResponse.next();
  if (pathname === "/hi" || pathname.startsWith("/hi/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }

  // A returning visitor who chose English (via the language switcher) lands on the English home page
  if (pathname === "/" && request.cookies.get(COOKIE)?.value === "en") {
    const url = request.nextUrl.clone();
    url.pathname = "/en";
    return NextResponse.redirect(url);
  }

  // Everything else renders the Hindi version internally
  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT}${pathname === "/" ? "" : pathname}`;
  url.search = search;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip API routes, Next internals and files with an extension (sitemap.xml, robots.txt, icon.svg, feed.xml…)
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
