import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { getDictionary, isLocale, localePath } from "@/lib/i18n";
import { alternatesFor, getT } from "@/lib/locale";
import { siteConfig, siteText } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return {
    title: getDictionary(lang).about.metaTitle,
    description:
      lang === "en"
        ? `${siteConfig.name} aims to bring the authentic wisdom of Sanatan Dharma to everyone in simple language.`
        : `${siteConfig.name} का उद्देश्य सनातन धर्म के प्रामाणिक ज्ञान को सरल भाषा में हर व्यक्ति तक पहुँचाना है।`,
    alternates: alternatesFor(lang, "/about"),
  };
}

export default async function AboutPage() {
  const { lang, t } = await getT();
  const login = localePath(lang, "/login");
  return (
    <>
      <PageHeader title={t.about.title} description={t.about.subtitle} crumbs={[{ name: t.about.title, href: "/about" }]} />
      <div className="article-content mx-auto max-w-3xl px-4 py-12">
        {lang === "en" ? (
          <>
            <p>
              <strong>{siteConfig.name}</strong> ({siteText("hi").name}) is a platform that presents the Vedas, Upanishads,
              Bhagavad Gita, Ramayana, Mahabharata, Puranas, festivals, pilgrimages and yoga in a simple, authentic and
              engaging way — in both Hindi and English.
            </p>
            <h2>Our mission</h2>
            <ul>
              <li>Explain the wisdom of ancient scriptures in today’s language</li>
              <li>Bring out the spiritual meaning behind festivals and traditions</li>
              <li>Help the younger generation connect with their culture</li>
              <li>Encourage positive and respectful discussion among readers</li>
            </ul>
            <blockquote>
              <p lang="sa">सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः।</p>
              <p lang="sa">सर्वे भद्राणि पश्यन्तु मा कश्चिद्दुःखभाग्भवेत्॥</p>
              <p>May all be happy, may all be free from illness; may all see goodness, and may no one suffer.</p>
            </blockquote>
            <h2>Join us</h2>
            <p>
              <Link href={login}>Sign in</Link> with Google to like articles and share your thoughts in the comments.
              Please keep the discussion kind and respectful. 🙏
            </p>
          </>
        ) : (
          <>
            <p>
              <strong>{siteConfig.nameHi}</strong> एक ऐसा मंच है जहाँ वेद, उपनिषद, भगवद् गीता, रामायण, महाभारत, पुराण,
              त्योहार, तीर्थ और योग से जुड़े विषयों को सरल, प्रामाणिक और रोचक ढंग से — हिन्दी और English दोनों में — प्रस्तुत
              किया जाता है।
            </p>
            <h2>हमारा उद्देश्य</h2>
            <ul>
              <li>प्राचीन ग्रंथों के ज्ञान को आज की भाषा में समझाना</li>
              <li>त्योहारों और परंपराओं के पीछे के आध्यात्मिक अर्थ को उजागर करना</li>
              <li>युवा पीढ़ी को अपनी संस्कृति से जोड़ना</li>
              <li>पाठकों के बीच सकारात्मक और सम्मानजनक चर्चा को बढ़ावा देना</li>
            </ul>
            <blockquote>
              <p>सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः।</p>
              <p>सर्वे भद्राणि पश्यन्तु मा कश्चिद्दुःखभाग्भवेत्॥</p>
            </blockquote>
            <h2>जुड़ें</h2>
            <p>
              Google से <Link href={login}>लॉगिन</Link> करके आप लेखों को पसंद कर सकते हैं और अपने विचार टिप्पणी के रूप में
              साझा कर सकते हैं। कृपया टिप्पणियों में शालीनता और सम्मान बनाए रखें। 🙏
            </p>
          </>
        )}
      </div>
    </>
  );
}
