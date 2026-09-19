import type { Metadata, Viewport } from "next";
import { Mukta, Noto_Serif_Devanagari } from "next/font/google";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { InlineScript } from "@/components/InlineScript";
import { JsonLd } from "@/components/JsonLd";
import { LocaleProvider } from "@/components/LocaleProvider";
import { bcp47, getDictionary, htmlLang, isLocale, localePath, locales, ogLocale } from "@/lib/i18n";
import { alternatesFor } from "@/lib/locale";
import { siteConfig, siteText } from "@/lib/site";
import "../globals.css";

const mukta = Mukta({
  variable: "--font-mukta",
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const notoSerif = Noto_Serif_Devanagari({
  variable: "--font-noto-serif",
  subsets: ["devanagari", "latin"],
  weight: ["500", "700"],
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const text = siteText(lang);
  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: `${siteConfig.name} | ${text.tagline}`,
      template: `%s | ${siteConfig.name}`,
    },
    description: text.description,
    keywords: siteConfig.keywords,
    applicationName: siteConfig.name,
    authors: [{ name: `${siteConfig.name} Team` }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    alternates: {
      ...alternatesFor(lang, "/"),
      types: { "application/rss+xml": [{ url: "/feed.xml", title: `${siteConfig.name} RSS` }] },
    },
    openGraph: {
      type: "website",
      locale: ogLocale[lang],
      alternateLocale: locales.filter((l) => l !== lang).map((l) => ogLocale[l]),
      url: localePath(lang, "/"),
      siteName: siteConfig.name,
      title: siteConfig.name,
      description: text.description,
    },
    twitter: {
      card: "summary_large_image",
      site: siteConfig.twitter,
      title: siteConfig.name,
      description: text.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf6ee" },
    { media: "(prefers-color-scheme: dark)", color: "#120d09" },
  ],
};

const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(!t){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){}})()`;

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  const text = siteText(lang);
  const home = `${siteConfig.url}${localePath(lang, "/")}`.replace(/\/$/, "");

  return (
    <html lang={htmlLang[lang]} className={`${mukta.variable} ${notoSerif.variable}`} suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <head>
        <InlineScript html={themeScript} />
      </head>
      <body className="flex min-h-screen flex-col">
        <LocaleProvider lang={lang}>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-saffron focus:px-4 focus:py-2 focus:text-white"
          >
            {t.nav.skip}
          </a>
          <JsonLd
            data={{
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": `${home}/#website`,
                  url: home || siteConfig.url,
                  name: siteConfig.name,
                  alternateName: siteConfig.nameHi,
                  description: text.description,
                  inLanguage: bcp47[lang],
                  publisher: { "@id": `${siteConfig.url}/#organization` },
                  potentialAction: {
                    "@type": "SearchAction",
                    target: {
                      "@type": "EntryPoint",
                      urlTemplate: `${siteConfig.url}${localePath(lang, "/blog")}?q={search_term_string}`,
                    },
                    "query-input": "required name=search_term_string",
                  },
                },
                {
                  "@type": "Organization",
                  "@id": `${siteConfig.url}/#organization`,
                  name: siteConfig.name,
                  url: siteConfig.url,
                  logo: `${siteConfig.url}/icon.svg`,
                },
              ],
            }}
          />
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </LocaleProvider>
      </body>
    </html>
  );
}
