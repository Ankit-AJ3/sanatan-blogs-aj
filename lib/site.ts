import type { Locale } from "./i18n";

export const siteConfig = {
  name: "Sanatan Blogs",
  nameHi: "सनातन ब्लॉग्स",
  tagline: "सनातन धर्म, संस्कृति और आध्यात्म की ज्ञान-गंगा",
  description:
    "Sanatan Blogs — वेद, उपनिषद, भगवद् गीता, पुराण, त्योहार, मंदिर, योग और भारतीय संस्कृति पर प्रामाणिक और सरल लेख। Explore timeless wisdom of Sanatan Dharma.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  keywords: [
    "Sanatan Dharma",
    "सनातन धर्म",
    "Hindu blogs",
    "Bhagavad Gita",
    "भगवद् गीता",
    "Vedas",
    "Upanishads",
    "Puranas",
    "Hindu festivals",
    "Indian culture",
    "Spirituality",
    "आध्यात्म",
  ],
  twitter: "@sanatanblogs",
  en: {
    tagline: "Timeless wisdom of Sanatan Dharma, culture and spirituality",
    description:
      "Sanatan Blogs — authentic, easy-to-read articles on the Vedas, Upanishads, Bhagavad Gita, Puranas, Hindu festivals, temples, yoga and Indian culture.",
  },
};


export const siteText = (lang: Locale) =>
  lang === "en"
    ? { name: siteConfig.name, tagline: siteConfig.en.tagline, description: siteConfig.en.description }
    : { name: siteConfig.nameHi, tagline: siteConfig.tagline, description: siteConfig.description };

export type Category = {
  slug: string;
  name: string;
  nameHi: string;
  description: string;
  gradient: [string, string];
};

export const categories: Category[] = [
  {
    slug: "bhagavad-gita",
    name: "Bhagavad Gita",
    nameHi: "भगवद् गीता",
    description: "श्रीकृष्ण के उपदेश — कर्म, भक्ति और ज्ञान का सार।",
    gradient: ["#b45309", "#7c2d12"],
  },
  {
    slug: "vedas-upanishads",
    name: "Vedas & Upanishads",
    nameHi: "वेद और उपनिषद",
    description: "मानवता के प्राचीनतम ग्रंथों का ज्ञान और दर्शन।",
    gradient: ["#a16207", "#713f12"],
  },
  {
    slug: "ramayana-mahabharata",
    name: "Ramayana & Mahabharata",
    nameHi: "रामायण और महाभारत",
    description: "इतिहास-ग्रंथों की कथाएँ और उनसे मिलने वाली सीख।",
    gradient: ["#9f1239", "#4c0519"],
  },
  {
    slug: "puranas",
    name: "Puranas & Kathas",
    nameHi: "पुराण और कथाएँ",
    description: "देवी-देवताओं, अवतारों और भक्तों की पावन कथाएँ।",
    gradient: ["#c2410c", "#7c2d12"],
  },
  {
    slug: "festivals",
    name: "Festivals & Vrat",
    nameHi: "त्योहार और व्रत",
    description: "पर्व, व्रत, पूजा-विधि और उनका आध्यात्मिक महत्व।",
    gradient: ["#ea580c", "#9a3412"],
  },
  {
    slug: "temples-tirth",
    name: "Temples & Tirth",
    nameHi: "मंदिर और तीर्थ",
    description: "ज्योतिर्लिंग, शक्तिपीठ, चारधाम और पवित्र तीर्थ-स्थल।",
    gradient: ["#b91c1c", "#7f1d1d"],
  },
  {
    slug: "yoga-dhyan",
    name: "Yoga & Dhyan",
    nameHi: "योग और ध्यान",
    description: "योग, प्राणायाम, ध्यान और स्वस्थ जीवन-शैली।",
    gradient: ["#0f766e", "#134e4a"],
  },
  {
    slug: "sanskriti",
    name: "Sanskriti & Parampara",
    nameHi: "संस्कृति और परंपरा",
    description: "संस्कार, रीति-रिवाज़ और भारतीय जीवन-मूल्य।",
    gradient: ["#92400e", "#451a03"],
  },
];

export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);

export const absoluteUrl = (path = "/") => `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;

const categoryDescriptionEn: Record<string, string> = {
  "bhagavad-gita": "The teachings of Shri Krishna — the essence of karma, bhakti and jnana.",
  "vedas-upanishads": "Wisdom and philosophy from humanity’s oldest scriptures.",
  "ramayana-mahabharata": "Stories from the Itihasas and the lessons they teach.",
  puranas: "Sacred stories of deities, avatars and devotees.",
  festivals: "Festivals, vrats, puja rituals and their spiritual meaning.",
  "temples-tirth": "Jyotirlingas, Shakti Peethas, Char Dham and holy pilgrimages.",
  "yoga-dhyan": "Yoga, pranayama, meditation and a healthy way of life.",
  sanskriti: "Sanskaras, customs and Indian values.",
};

export const categoryText = (c: Category, lang: Locale) =>
  lang === "en"
    ? { name: c.name, description: categoryDescriptionEn[c.slug] ?? c.name }
    : { name: c.nameHi, description: c.description };
