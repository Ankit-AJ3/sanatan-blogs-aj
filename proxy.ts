import { NextResponse, type NextRequest } from "next/server";

// Keep in sync with lib/i18n.ts (proxy should not import app modules)
const DEFAULT = "hi";
const COOKIE = "lang";

/** Unguessable path that serves the admin login page (see .env.example). */
const ADMIN_LOGIN_PATH = process.env.ADMIN_LOGIN_PATH?.replace(/^\/+|\/+$/g, "");
/** Internal route the secret path is rewritten to; never reachable directly. */
const ADMIN_LOGIN_ROUTE = "admin-login";

/** Splits "/en/rest" into its locale prefix and the rest of the path. */
function splitLocale(pathname: string) {
  const m = /^\/(hi|en)(?=\/|$)/.exec(pathname);
  return m ? { lang: m[1], rest: pathname.slice(m[0].length) || "/" } : { lang: null, rest: pathname };
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const { lang: prefix, rest } = splitLocale(pathname);
  const lang = prefix ?? DEFAULT;
  const url = request.nextUrl.clone();

  // The real admin login route is only reachable through the secret path
  if (rest === `/${ADMIN_LOGIN_ROUTE}` || rest.startsWith(`/${ADMIN_LOGIN_ROUTE}/`)) {
    url.pathname = `/${DEFAULT}/not-found`;
    return NextResponse.rewrite(url);
  }

  // Secret admin login path -> the real route, keeping the visitor's language
  if (ADMIN_LOGIN_PATH && (rest === `/${ADMIN_LOGIN_PATH}` || rest === `/${ADMIN_LOGIN_PATH}/`)) {
    url.pathname = `/${lang}/${ADMIN_LOGIN_ROUTE}`;
    return NextResponse.rewrite(url);
  }

  // English lives under /en — serve as-is
  if (prefix === "en") return NextResponse.next();

  // (Generated OG images are referenced at /hi/.../opengraph-image, so serve those directly.)
  if (pathname.startsWith("/hi/") && pathname.endsWith("/opengraph-image")) return NextResponse.next();

  // Hindi is the default and has no prefix: /hi/x -> /x (single canonical URL)
  if (prefix === "hi") {
    url.pathname = rest;
    return NextResponse.redirect(url, 308);
  }

  // A returning visitor who chose English (via the language switcher) lands on the English home page
  if (pathname === "/" && request.cookies.get(COOKIE)?.value === "en") {
    url.pathname = "/en";
    return NextResponse.redirect(url);
  }

  // Everything else renders the Hindi version internally
  url.pathname = `/${DEFAULT}${pathname === "/" ? "" : pathname}`;
  url.search = search;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip API routes, Next internals and files with an extension (sitemap.xml, robots.txt, icon.svg, feed.xml…)
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
