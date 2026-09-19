export const siteConfig = {
  name: "Sanatan Blogs",
  nameHi: "सनातन ब्लॉग्स",
  tagline: "सनातन धर्म, संस्कृति और आध्यात्म की ज्ञान-गंगा",
  description:
    "Sanatan Blogs — वेद, उपनिषद, भगवद् गीता, पुराण, त्योहार, मंदिर, योग और भारतीय संस्कृति पर प्रामाणिक और सरल लेख। Explore timeless wisdom of Sanatan Dharma.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  locale: "hi_IN",
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
};

export type Category = {
  slug: string;
  name: string;
  nameHi: string;
  description: string;
  icon: string;
  gradient: [string, string];
};

export const categories: Category[] = [
  {
    slug: "bhagavad-gita",
    name: "Bhagavad Gita",
    nameHi: "भगवद् गीता",
    description: "श्रीकृष्ण के उपदेश — कर्म, भक्ति और ज्ञान का सार।",
    icon: "🪷",
    gradient: ["#b45309", "#7c2d12"],
  },
  {
    slug: "vedas-upanishads",
    name: "Vedas & Upanishads",
    nameHi: "वेद और उपनिषद",
    description: "मानवता के प्राचीनतम ग्रंथों का ज्ञान और दर्शन।",
    icon: "📜",
    gradient: ["#a16207", "#713f12"],
  },
  {
    slug: "ramayana-mahabharata",
    name: "Ramayana & Mahabharata",
    nameHi: "रामायण और महाभारत",
    description: "इतिहास-ग्रंथों की कथाएँ और उनसे मिलने वाली सीख।",
    icon: "🏹",
    gradient: ["#9f1239", "#4c0519"],
  },
  {
    slug: "puranas",
    name: "Puranas & Kathas",
    nameHi: "पुराण और कथाएँ",
    description: "देवी-देवताओं, अवतारों और भक्तों की पावन कथाएँ।",
    icon: "🐚",
    gradient: ["#c2410c", "#7c2d12"],
  },
  {
    slug: "festivals",
    name: "Festivals & Vrat",
    nameHi: "त्योहार और व्रत",
    description: "पर्व, व्रत, पूजा-विधि और उनका आध्यात्मिक महत्व।",
    icon: "🪔",
    gradient: ["#ea580c", "#9a3412"],
  },
  {
    slug: "temples-tirth",
    name: "Temples & Tirth",
    nameHi: "मंदिर और तीर्थ",
    description: "ज्योतिर्लिंग, शक्तिपीठ, चारधाम और पवित्र तीर्थ-स्थल।",
    icon: "🛕",
    gradient: ["#b91c1c", "#7f1d1d"],
  },
  {
    slug: "yoga-dhyan",
    name: "Yoga & Dhyan",
    nameHi: "योग और ध्यान",
    description: "योग, प्राणायाम, ध्यान और स्वस्थ जीवन-शैली।",
    icon: "🧘",
    gradient: ["#0f766e", "#134e4a"],
  },
  {
    slug: "sanskriti",
    name: "Sanskriti & Parampara",
    nameHi: "संस्कृति और परंपरा",
    description: "संस्कार, रीति-रिवाज़ और भारतीय जीवन-मूल्य।",
    icon: "🕉️",
    gradient: ["#92400e", "#451a03"],
  },
];

export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);

export const absoluteUrl = (path = "/") => `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
