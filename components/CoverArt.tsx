import Image from "next/image";
import { getCategory } from "@/lib/site";

/** Cover image if provided, otherwise a decorative gradient based on the category. */
export function CoverArt({
  title,
  coverImage,
  category,
  priority = false,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  className = "",
}: {
  title: string;
  coverImage: string | null;
  category: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const cat = getCategory(category);
  if (coverImage) {
    return (
      <div className={`relative overflow-hidden bg-surface-2 ${className}`}>
        <Image
          src={coverImage}
          alt={title}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
    );
  }
  const [from, to] = cat?.gradient ?? ["#d9631a", "#7a1f1f"];
  return (
    <div
      className={`relative grid place-items-center overflow-hidden ${className}`}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      role="img"
      aria-label={title}
    >
      <svg className="absolute inset-0 size-full opacity-20" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <g fill="none" stroke="#fff" strokeWidth="0.6">
          {Array.from({ length: 12 }).map((_, i) => (
            <ellipse key={i} cx="100" cy="100" rx="80" ry="28" transform={`rotate(${i * 15} 100 100)`} />
          ))}
          <circle cx="100" cy="100" r="18" />
          <circle cx="100" cy="100" r="92" />
        </g>
      </svg>
      <span className="relative text-6xl drop-shadow-lg transition-transform duration-500 group-hover:scale-110" aria-hidden>
        {cat?.icon ?? "🕉️"}
      </span>
    </div>
  );
}
