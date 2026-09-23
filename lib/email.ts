import "server-only";
import { siteConfig } from "./site";

/**
 * Sends transactional mail through whichever provider is configured:
 *   1. Resend  — RESEND_API_KEY
 *   2. SMTP    — SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (e.g. Gmail app password)
 *   3. Nothing configured — the mail is printed to the server console (development only)
 */
const from = process.env.EMAIL_FROM || `${siteConfig.name} <onboarding@resend.dev>`;

export const emailConfigured = !!(process.env.RESEND_API_KEY || (process.env.SMTP_HOST && process.env.SMTP_USER));

export async function sendEmail({ to, subject, html, text }: { to: string; subject: string; html: string; text: string }) {
  if (process.env.RESEND_API_KEY) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html, text }),
    });
    if (!res.ok) throw new Error(`Resend failed: ${res.status} ${await res.text()}`);
    return;
  }

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    const { createTransport } = await import("nodemailer");
    const port = Number(process.env.SMTP_PORT ?? 587);
    const transport = createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transport.sendMail({ from, to, subject, html, text });
    return;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("No email provider configured — set RESEND_API_KEY or SMTP_* in the environment.");
  }
  console.info(`\n──────── EMAIL (dev, not sent) ────────\nTo: ${to}\nSubject: ${subject}\n\n${text}\n───────────────────────────────────────\n`);
}

const otpSubjects = {
  "email-verification": { hi: "आपका सत्यापन कोड", en: "Your verification code" },
  "sign-in": { hi: "आपका लॉगिन कोड", en: "Your sign-in code" },
  "forget-password": { hi: "पासवर्ड रीसेट कोड", en: "Password reset code" },
  "change-email": { hi: "ईमेल बदलने का कोड", en: "Email change code" },
} as const;

export type OtpType = keyof typeof otpSubjects;

/** Bilingual OTP email — Hindi first, English below. */
export async function sendOtpEmail({ to, otp, type }: { to: string; otp: string; type: OtpType }) {
  const subject = `${otp} — ${otpSubjects[type].hi} | ${siteConfig.name}`;
  const minutes = 10;
  const text = [
    `${siteConfig.nameHi} (${siteConfig.name})`,
    "",
    `आपका कोड: ${otp}`,
    `यह कोड ${minutes} मिनट तक मान्य है। किसी के साथ साझा न करें।`,
    "",
    `Your code: ${otp}`,
    `This code is valid for ${minutes} minutes. Please don't share it with anyone.`,
    "",
    `— ${siteConfig.name} · ${siteConfig.url}`,
  ].join("\n");

  const html = `<!doctype html>
<html lang="hi"><body style="margin:0;background:#fbf6ee;padding:24px;font-family:system-ui,Segoe UI,Arial,sans-serif;color:#2a1a10">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="100%" style="max-width:480px;background:#fffdf9;border:1px solid #eadccb;border-radius:18px;overflow:hidden">
      <tr><td style="background:linear-gradient(135deg,#d9631a,#7a1f1f);padding:20px 24px;color:#fff">
        <div style="font-size:22px;font-weight:700">${siteConfig.nameHi}</div>
        <div style="font-size:12px;letter-spacing:2px;opacity:.85">${siteConfig.name.toUpperCase()}</div>
      </td></tr>
      <tr><td style="padding:28px 24px">
        <p style="margin:0 0 6px">नमस्ते,</p>
        <p style="margin:0 0 18px;color:#6e5b4b">${otpSubjects[type].hi} नीचे दिया गया है:</p>
        <div style="margin:0 auto 18px;max-width:280px;background:#fde9d7;border:1px dashed #d9631a;border-radius:14px;padding:18px;text-align:center;font-size:34px;font-weight:700;letter-spacing:10px;color:#7a1f1f">${otp}</div>
        <p style="margin:0 0 18px;color:#6e5b4b;font-size:14px">यह कोड ${minutes} मिनट तक मान्य है। कृपया इसे किसी के साथ साझा न करें।<br>
        This code is valid for ${minutes} minutes. Please don't share it with anyone.</p>
        <p style="margin:0;color:#8b7a6b;font-size:13px">यदि आपने यह अनुरोध नहीं किया है तो इस ईमेल को अनदेखा करें.<br>If you didn't request this, you can safely ignore this email.</p>
      </td></tr>
      <tr><td style="border-top:1px solid #eadccb;padding:14px 24px;text-align:center;color:#8b7a6b;font-size:12px">
        <a href="${siteConfig.url}" style="color:#d9631a;text-decoration:none">${siteConfig.url.replace(/^https?:\/\//, "")}</a>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;

  await sendEmail({ to, subject, html, text });
}
