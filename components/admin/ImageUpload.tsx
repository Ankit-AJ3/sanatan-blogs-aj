"use client";

import { useRef, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";

export type UploadedImage = { url: string; publicId: string; width: number; height: number };

export async function uploadToCloudinary(file: File): Promise<UploadedImage> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "upload_failed");
  return data as UploadedImage;
}

/** Cover image picker: drag & drop or click, uploads straight to Cloudinary. */
export function ImageUpload({
  value,
  publicId,
  onChange,
}: {
  value: string | null;
  publicId: string | null;
  onChange: (image: { url: string | null; publicId: string | null }) => void;
}) {
  const { t } = useLocale();
  const e = t.editor.upload;
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const image = await uploadToCloudinary(file);
      onChange({ url: image.url, publicId: image.publicId });
    } catch (err) {
      setError(e.errors[(err as Error).message as keyof typeof e.errors] ?? e.errors.upload_failed);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    const id = publicId;
    onChange({ url: null, publicId: null });
    if (id) await fetch("/api/upload", { method: "DELETE", body: JSON.stringify({ publicId: id }) }).catch(() => {});
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(ev) => handleFile(ev.target.files?.[0])}
      />

      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-line">
          {/* eslint-disable-next-line @next/next/no-img-element -- editor preview of an arbitrary URL */}
          <img src={value} alt="" className="aspect-[16/9] w-full object-cover" />
          <div className="flex gap-2 p-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex-1 rounded-lg border border-line py-1.5 text-sm font-semibold hover:border-saffron"
            >
              {e.replace}
            </button>
            <button
              type="button"
              onClick={remove}
              className="flex-1 rounded-lg border border-line py-1.5 text-sm font-semibold text-red-600 hover:border-red-400"
            >
              {e.remove}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(ev) => {
            ev.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(ev) => {
            ev.preventDefault();
            setDragging(false);
            handleFile(ev.dataTransfer.files?.[0]);
          }}
          disabled={busy}
          className={`grid w-full place-items-center gap-1 rounded-xl border-2 border-dashed p-6 text-center transition ${
            dragging ? "border-saffron bg-saffron-soft" : "border-line hover:border-saffron"
          }`}
        >
          {busy ? (
            <>
              <span className="size-6 animate-spin rounded-full border-2 border-saffron border-t-transparent" />
              <span className="text-sm text-muted">{e.uploading}</span>
            </>
          ) : (
            <>
              <span className="text-2xl" aria-hidden>
                🖼️
              </span>
              <span className="font-semibold">{e.choose}</span>
              <span className="text-xs text-muted">{e.hint}</span>
            </>
          )}
        </button>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
