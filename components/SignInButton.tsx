"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { GoogleIcon } from "./GoogleIcon";

export function SignInButton({
  callbackURL,
  label = "Google से लॉगिन करें",
  className = "",
}: {
  callbackURL?: string;
  label?: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setLoading(true);
    setError(null);
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: callbackURL ?? window.location.pathname,
    });
    if (error) {
      setError(error.message ?? "लॉगिन नहीं हो सका, कृपया पुनः प्रयास करें।");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={signIn}
        disabled={loading}
        className={`inline-flex items-center justify-center gap-3 rounded-full border border-line bg-surface px-5 py-2.5 font-semibold text-ink shadow-sm transition hover:border-saffron hover:shadow-md disabled:opacity-60 ${className}`}
      >
        {loading ? (
          <span className="size-5 animate-spin rounded-full border-2 border-saffron border-t-transparent" />
        ) : (
          <GoogleIcon />
        )}
        {label}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
