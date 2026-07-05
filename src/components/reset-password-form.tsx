"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon, LockKeyIcon, ShieldCheckIcon } from "@phosphor-icons/react";
import type { Locale } from "@/data/jobs";
import { createClient } from "@/lib/supabase/client";

const copy = {
  en: {
    employer: "Employer security",
    title: "Choose a new password",
    body: "Use at least 8 characters. Your new password will replace the old one immediately.",
    password: "New password",
    confirm: "Confirm new password",
    action: "Update password",
    processing: "Updating password…",
    mismatch: "The passwords do not match.",
    weak: "Password must be at least 8 characters.",
    error: "This reset link is invalid or has expired. Request a new link.",
    back: "Back to employer login",
    secure: "This secure recovery session is valid only for your account.",
  },
  ms: {
    employer: "Keselamatan majikan",
    title: "Pilih kata laluan baharu",
    body: "Gunakan sekurang-kurangnya 8 aksara. Kata laluan baharu akan menggantikan kata laluan lama serta-merta.",
    password: "Kata laluan baharu",
    confirm: "Sahkan kata laluan baharu",
    action: "Kemas kini kata laluan",
    processing: "Mengemas kini kata laluan…",
    mismatch: "Kata laluan tidak sepadan.",
    weak: "Kata laluan mestilah sekurang-kurangnya 8 aksara.",
    error: "Pautan tetapan semula ini tidak sah atau telah tamat tempoh. Minta pautan baharu.",
    back: "Kembali ke log masuk majikan",
    secure: "Sesi pemulihan selamat ini hanya sah untuk akaun anda.",
  },
} as const;

export function ResetPasswordForm({ initialLocale }: { initialLocale: Locale }) {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const t = copy[locale];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") || "");
    const confirmation = String(data.get("confirmation") || "");

    if (password.length < 8) {
      setError(t.weak);
      return;
    }
    if (password !== confirmation) {
      setError(t.mismatch);
      return;
    }

    setBusy(true);
    setError("");
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(t.error);
      setBusy(false);
      return;
    }

    await supabase.auth.signOut();
    router.replace(`/employer/login?reset=success&lang=${locale}`);
    router.refresh();
  }

  return (
    <main className="auth-page reset-password-page">
      <header className="auth-header">
        <div className="auth-header-inner">
          <Link className="wordmark" href="/">Job<span>Linker</span></Link>
          <div className="auth-language" aria-label="Language selector">
            <button type="button" aria-pressed={locale === "en"} onClick={() => setLocale("en")}>EN</button><span>|</span>
            <button type="button" aria-pressed={locale === "ms"} onClick={() => setLocale("ms")}>BM</button>
          </div>
        </div>
      </header>

      <div className="reset-password-shell">
        <section className="auth-card reset-password-card">
          <Link className="auth-reset-back" href="/employer/login"><ArrowLeftIcon size={16} />{t.back}</Link>
          <div className="reset-password-icon"><ShieldCheckIcon size={27} weight="fill" /></div>
          <div className="auth-card-heading">
            <p className="auth-eyebrow">{t.employer}</p>
            <h1>{t.title}</h1>
            <p>{t.body}</p>
          </div>
          <form className="auth-form" onSubmit={submit}>
            <label>
              <span>{t.password}</span>
              <div className="password-field"><LockKeyIcon size={19} /><input name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={8} required /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((current) => !current)}>{showPassword ? <EyeSlashIcon size={20} /> : <EyeIcon size={20} />}</button></div>
            </label>
            <label>
              <span>{t.confirm}</span>
              <div className="password-field"><LockKeyIcon size={19} /><input name="confirmation" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={8} required /></div>
            </label>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="auth-submit" type="submit" disabled={busy}>{busy ? t.processing : t.action}</button>
          </form>
          <p className="auth-secure"><LockKeyIcon size={15} weight="fill" />{t.secure}</p>
        </section>
      </div>
    </main>
  );
}
