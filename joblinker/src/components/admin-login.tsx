"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  LockKeyIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react";
import type { Locale } from "@/data/jobs";
import { createClient } from "@/lib/supabase/client";

const copy = {
  en: {
    access: "JobLinker administration",
    title: "Keep the job board trusted",
    intro: "Review employer listings, manage featured jobs, and protect the quality of the public board.",
    benefitOne: "Review pending job listings",
    benefitTwo: "Approve or reject with feedback",
    benefitThree: "Manage featured visibility",
    heading: "Admin login",
    body: "Use an authorised JobLinker admin account.",
    email: "Admin email",
    password: "Password",
    submit: "Log in to Admin Panel",
    processing: "Checking access…",
    invalid: "The email or password is incorrect.",
    denied: "This account does not have Admin access.",
    failed: "Admin login could not be completed. Please try again.",
    secure: "Admin access is checked against the protected allowlist.",
  },
  ms: {
    access: "Pentadbiran JobLinker",
    title: "Pastikan papan kerja dipercayai",
    intro: "Semak iklan majikan, urus kerja Featured dan jaga kualiti papan kerja awam.",
    benefitOne: "Semak iklan kerja yang menunggu",
    benefitTwo: "Lulus atau tolak dengan maklum balas",
    benefitThree: "Urus paparan Featured",
    heading: "Log masuk Admin",
    body: "Gunakan akaun Admin JobLinker yang dibenarkan.",
    email: "E-mel Admin",
    password: "Kata laluan",
    submit: "Log masuk ke Admin Panel",
    processing: "Menyemak akses…",
    invalid: "E-mel atau kata laluan tidak betul.",
    denied: "Akaun ini tidak mempunyai akses Admin.",
    failed: "Log masuk Admin tidak dapat diselesaikan. Sila cuba lagi.",
    secure: "Akses Admin disemak melalui senarai kebenaran yang dilindungi.",
  },
} as const;

export function AdminLogin({ initialAccessError = false }: { initialAccessError?: boolean }) {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>("en");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(initialAccessError ? copy.en.denied : "");
  const t = copy[locale];

  function setLanguage(nextLocale: Locale) {
    setLocale(nextLocale);
    setError(initialAccessError ? copy[nextLocale].denied : "");
    document.documentElement.lang = nextLocale;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") || "").trim();
    const password = String(data.get("password") || "");
    const supabase = createClient();

    setBusy(true);
    setError("");
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError || !signInData.user) {
      setBusy(false);
      setError(t.invalid);
      return;
    }

    const { data: admin, error: accessError } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", signInData.user.id)
      .maybeSingle();

    if (accessError || !admin) {
      await supabase.auth.signOut();
      setBusy(false);
      setError(accessError ? t.failed : t.denied);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="auth-page">cw
    
      <header className="auth-header">
        <div className="auth-header-inner">
          <Link className="wordmark" href="/">Job<span>Linker</span></Link>
          <div className="auth-language" aria-label="Language selector">
            <button type="button" aria-pressed={locale === "en"} onClick={() => setLanguage("en")}>EN</button><span>|</span>
            <button type="button" aria-pressed={locale === "ms"} onClick={() => setLanguage("ms")}>BM</button>
          </div>
        </div>
      </header>

      <div className="auth-layout">
        <section className="auth-context">
          <div className="auth-context-copy">
            <p className="auth-eyebrow"><ShieldCheckIcon size={17} weight="fill" />{t.access}</p>
            <h1>{t.title}</h1>
            <p>{t.intro}</p>
            <ul>{[t.benefitOne, t.benefitTwo, t.benefitThree].map((item) => <li key={item}><CheckCircleIcon size={19} weight="fill" />{item}</li>)}</ul>
          </div>
        </section>

        <section className="auth-form-section">
          <div className="auth-card">
            <div className="auth-card-heading"><h2>{t.heading}</h2><p>{t.body}</p></div>
            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <label><span>{t.email}</span><input name="email" type="email" autoComplete="email" required /></label>
              <label>
                <span>{t.password}</span>
                <div className="password-field">
                  <LockKeyIcon size={19} aria-hidden="true" />
                  <input name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required />
                  <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <EyeSlashIcon size={20} /> : <EyeIcon size={20} />}</button>
                </div>
              </label>
              {error && <p className="auth-error" role="alert">{error}</p>}
              <button className="auth-submit" type="submit" disabled={busy}>{busy ? t.processing : t.submit}</button>
            </form>
            <p className="auth-secure"><LockKeyIcon size={15} weight="fill" />{t.secure}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
