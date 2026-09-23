"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { GoogleIcon } from "./GoogleIcon";
import { ArrowLeftIcon, CheckIcon, PreviewIcon } from "./icons";
import { useLocale } from "./LocaleProvider";

type Mode = "signin" | "signup" | "otp" | "forgot" | "reset";
type AuthError = { code?: string; message?: string } | null | undefined;

const RESEND_SECONDS = 45;

const field =
  "w-full rounded-xl border border-line bg-bg px-4 py-2.5 outline-none transition focus:border-saffron focus:ring-2 focus:ring-saffron/20";

export function AuthForm({ callbackURL, allowSignUp = true }: { callbackURL: string; allowSignUp?: boolean }) {
  const { t } = useLocale();
  const a = t.auth;
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const otpRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  useEffect(() => {
    if (mode === "otp" || mode === "reset") otpRef.current?.focus();
  }, [mode]);

  const messageFor = (err: AuthError) => {
    const errors = a.errors as Record<string, string>;
    return (err?.code && errors[err.code]) || err?.message || errors.generic;
  };

  function goTo(next: Mode, opts: { error?: string | null; notice?: string | null } = {}) {
    setMode(next);
    setError(opts.error ?? null);
    setNotice(opts.notice ?? null);
    setOtp("");
  }

  async function signInWithGoogle() {
    setGoogleBusy(true);
    setError(null);
    const { error } = await authClient.signIn.social({ provider: "google", callbackURL });
    if (error) {
      setError(messageFor(error));
      setGoogleBusy(false);
    }
  }

  async function sendVerificationCode(to: string) {
    await authClient.emailOtp.sendVerificationOtp({ email: to, type: "email-verification" });
    setCooldown(RESEND_SECONDS);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      if (mode === "signup") {
        const { error } = await authClient.signUp.email({ name, email, password });
        if (error) return setError(messageFor(error));
        // Better Auth mails the OTP on sign-up
        setCooldown(RESEND_SECONDS);
        return goTo("otp");
      }

      if (mode === "signin") {
        const { error } = await authClient.signIn.email({ email, password });
        if (error) {
          if (error.code === "EMAIL_NOT_VERIFIED") {
            await sendVerificationCode(email);
            return goTo("otp", { notice: a.verifyNotice });
          }
          return setError(messageFor(error));
        }
        router.push(callbackURL);
        router.refresh();
        return;
      }

      if (mode === "otp") {
        const { error } = await authClient.emailOtp.verifyEmail({ email, otp });
        if (error) return setError(messageFor(error));
        router.push(callbackURL);
        router.refresh();
        return;
      }

      if (mode === "forgot") {
        const { error } = await authClient.forgetPassword.emailOtp({ email });
        if (error) return setError(messageFor(error));
        setCooldown(RESEND_SECONDS);
        return goTo("reset");
      }

      if (mode === "reset") {
        const { error } = await authClient.emailOtp.resetPassword({ email, otp, password });
        if (error) return setError(messageFor(error));
        setPassword("");
        return goTo("signin", { notice: a.passwordReset });
      }
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    if (cooldown > 0) return;
    setError(null);
    try {
      if (mode === "reset") await authClient.forgetPassword.emailOtp({ email });
      else await sendVerificationCode(email);
      setCooldown(RESEND_SECONDS);
      setNotice(a.resent);
    } catch {
      setError(a.errors.generic);
    }
  }

  const isOtpStep = mode === "otp" || mode === "reset";

  return (
    <div>
      {/* Google is the quickest path, so it stays on top */}
      {!isOtpStep && (
        <>
          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={googleBusy}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-line bg-surface py-3 font-semibold text-ink shadow-sm transition hover:border-saffron hover:shadow-md disabled:opacity-60"
          >
            {googleBusy ? (
              <span className="size-5 animate-spin rounded-full border-2 border-saffron border-t-transparent" />
            ) : (
              <GoogleIcon />
            )}
            {t.login.button}
          </button>
          <div className="my-5 flex items-center gap-3 text-sm text-muted">
            <span className="h-px flex-1 bg-line" />
            {a.or}
            <span className="h-px flex-1 bg-line" />
          </div>
        </>
      )}

      {allowSignUp && mode !== "forgot" && !isOtpStep && (
        <div role="tablist" aria-label={a.tabSignIn} className="mb-5 flex rounded-full border border-line bg-surface p-1">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => goTo(m)}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                mode === m ? "bg-gradient-to-r from-saffron to-maroon text-white shadow" : "text-muted"
              }`}
            >
              {m === "signin" ? a.tabSignIn : a.tabSignUp}
            </button>
          ))}
        </div>
      )}

      {(mode === "forgot" || isOtpStep) && (
        <div className="mb-4 text-left">
          <h2 className="font-serif text-xl font-bold">
            {mode === "forgot" ? a.forgotTitle : mode === "reset" ? a.resetTitle : a.otpTitle}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {mode === "forgot" ? a.forgotText : mode === "reset" ? a.resetText(email) : a.otpText(email)}
          </p>
        </div>
      )}

      <form onSubmit={submit} className="space-y-4 text-left">
        {mode === "signup" && (
          <div>
            <label htmlFor="auth-name" className="mb-1.5 block text-sm font-semibold">
              {a.name}
            </label>
            <input
              id="auth-name"
              name="name"
              autoComplete="name"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={a.namePlaceholder}
              className={field}
            />
          </div>
        )}

        {!isOtpStep && (
          <div>
            <label htmlFor="auth-email" className="mb-1.5 block text-sm font-semibold">
              {a.email}
            </label>
            <input
              id="auth-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={a.emailPlaceholder}
              className={field}
            />
          </div>
        )}

        {isOtpStep && (
          <div>
            <label htmlFor="auth-otp" className="mb-1.5 block text-sm font-semibold">
              {a.otpLabel}
            </label>
            <input
              ref={otpRef}
              id="auth-otp"
              name="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={6}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="••••••"
              className={`${field} text-center font-mono text-2xl tracking-[0.5em]`}
            />
          </div>
        )}

        {(mode === "signin" || mode === "signup" || mode === "reset") && (
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="auth-password" className="text-sm font-semibold">
                {mode === "reset" ? a.newPassword : a.password}
              </label>
              {mode === "signin" && (
                <button type="button" onClick={() => goTo("forgot")} className="text-sm text-saffron hover:underline">
                  {a.forgot}
                </button>
              )}
            </div>
            <div className="relative">
              <input
                id="auth-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                required
                minLength={mode === "signin" ? undefined : 8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${field} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? a.hidePassword : a.showPassword}
                className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-ink"
              >
                <PreviewIcon className="size-4" aria-hidden />
              </button>
            </div>
            {mode !== "signin" && <p className="mt-1 text-xs text-muted">{a.passwordHint}</p>}
          </div>
        )}

        {notice && (
          <p className="flex items-start gap-2 rounded-xl bg-saffron-soft px-3 py-2 text-sm">
            <CheckIcon className="mt-0.5 size-4 shrink-0 text-saffron" aria-hidden />
            {notice}
          </p>
        )}
        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          disabled={busy}
          className="w-full rounded-full bg-gradient-to-r from-saffron to-maroon py-3 font-semibold text-white shadow-md transition hover:brightness-110 disabled:opacity-60"
        >
          {busy
            ? a.working
            : mode === "signin"
              ? a.signIn
              : mode === "signup"
                ? a.signUp
                : mode === "otp"
                  ? a.verify
                  : mode === "forgot"
                    ? a.sendCode
                    : a.resetButton}
        </button>
      </form>

      {isOtpStep && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
          <button
            type="button"
            onClick={resend}
            disabled={cooldown > 0}
            className="font-semibold text-saffron hover:underline disabled:text-muted disabled:no-underline"
          >
            {cooldown > 0 ? a.resendIn(cooldown) : a.resend}
          </button>
          <button type="button" onClick={() => goTo(mode === "reset" ? "forgot" : "signup")} className="text-muted hover:text-ink">
            {a.changeEmail}
          </button>
        </div>
      )}

      {(mode === "forgot" || isOtpStep) && (
        <button
          type="button"
          onClick={() => goTo("signin")}
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-saffron"
        >
          <ArrowLeftIcon className="size-4" aria-hidden />
          {a.backToSignIn}
        </button>
      )}
    </div>
  );
}
