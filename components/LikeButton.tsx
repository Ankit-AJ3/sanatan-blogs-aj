"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { toggleLike } from "@/app/actions";

export function LikeButton({
  postId,
  slug,
  initialCount,
  initialLiked,
  isLoggedIn,
}: {
  postId: string;
  slug: string;
  initialCount: number;
  initialLiked: boolean;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [state, setOptimistic] = useOptimistic(
    { liked: initialLiked, count: initialCount },
    (s, liked: boolean) => ({ liked, count: s.count + (liked ? 1 : -1) }),
  );

  function onClick() {
    if (!isLoggedIn) {
      router.push(`/login?next=${encodeURIComponent(`/blog/${slug}`)}`);
      return;
    }
    startTransition(async () => {
      setOptimistic(!state.liked);
      const res = await toggleLike(postId);
      if ("error" in res) router.push(`/login?next=${encodeURIComponent(`/blog/${slug}`)}`);
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={state.liked}
      aria-label={state.liked ? "पसंद हटाएँ" : "लेख पसंद करें"}
      className={`group inline-flex items-center gap-2 rounded-full border px-5 py-2.5 font-semibold transition active:scale-95 ${
        state.liked
          ? "border-saffron bg-saffron text-white shadow-lg shadow-saffron/30"
          : "border-line bg-surface text-ink hover:border-saffron hover:text-saffron"
      }`}
    >
      <span className={`text-lg transition-transform ${state.liked ? "scale-110" : "group-hover:scale-110"}`} aria-hidden>
        🙏
      </span>
      <span>{state.liked ? "पसंद किया" : "पसंद करें"}</span>
      <span className={`rounded-full px-2 py-0.5 text-sm ${state.liked ? "bg-white/20" : "bg-surface-2"}`}>
        {state.count}
      </span>
    </button>
  );
}
