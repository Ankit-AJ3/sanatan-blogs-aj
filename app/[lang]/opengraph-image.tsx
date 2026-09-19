import { renderOg, ogSize } from "@/lib/og";
import { siteConfig } from "@/lib/site";

export const alt = siteConfig.name;
export const size = ogSize;
export const contentType = "image/png";

export default async function Image() {
  return renderOg({
    heading: "Wisdom of Sanatan Dharma",
    subheading: "Vedas · Gita · Puranas · Festivals · Yoga",
  });
}
