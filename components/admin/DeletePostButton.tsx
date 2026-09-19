"use client";

import { useTransition } from "react";
import { deletePost } from "@/app/actions";
import { useLocale } from "@/components/LocaleProvider";

export function DeletePostButton({ id }: { id: string }) {
  const { t } = useLocale();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm(t.admin.confirmDeletePost)) start(() => deletePost(id));
      }}
      className="text-red-600 hover:underline disabled:opacity-50"
    >
      {pending ? "…" : t.admin.delete}
    </button>
  );
}
