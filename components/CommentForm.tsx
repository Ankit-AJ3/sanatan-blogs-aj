"use client";

import { useActionState, useEffect, useRef, useTransition } from "react";
import { addComment, deleteComment, type CommentState } from "@/app/actions";
import { useLocale } from "./LocaleProvider";

export function CommentForm({ postId }: { postId: string }) {
  const { t } = useLocale();
  const [state, action, pending] = useActionState<CommentState, FormData>(addComment.bind(null, postId), {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex-1">
      <label htmlFor="comment" className="sr-only">
        {t.comments.label}
      </label>
      <textarea
        id="comment"
        name="content"
        required
        minLength={2}
        maxLength={2000}
        rows={3}
        placeholder={t.comments.placeholder}
        className="w-full resize-y rounded-2xl border border-line bg-bg px-4 py-3 outline-none transition focus:border-saffron"
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="text-sm text-red-600" role="alert">
          {state.error && t.comments.errors[state.error]}
        </p>
        <button
          disabled={pending}
          className="rounded-full bg-gradient-to-r from-saffron to-maroon px-5 py-2 font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
        >
          {pending ? t.comments.sending : t.comments.submit}
        </button>
      </div>
    </form>
  );
}

export function DeleteCommentButton({ commentId }: { commentId: string }) {
  const { t } = useLocale();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm(t.comments.confirmDelete)) start(() => deleteComment(commentId));
      }}
      className="ml-auto text-xs text-muted hover:text-red-600 disabled:opacity-50"
    >
      {pending ? t.comments.deleting : t.comments.delete}
    </button>
  );
}
