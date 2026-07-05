"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  LockKeyIcon,
  WhatsappLogoIcon,
} from "@phosphor-icons/react";
import type { Locale } from "@/data/jobs";
import { createClient, createRecoveryClient } from "@/lib/supabase/client";
import { PRIVACY_VERSION, TERMS_VERSION } from "@/lib/legal";

type AuthMode = "login" | "register" | "forgot";

const copy = {
  en: {
    back: "Back to jobs",
    employer: "Employer access",
    title: "Hire workers faster",
    intro: "Post jobs for free and receive enquiries directly through WhatsApp.",
    benefitOne: "Free job posting",
    benefitTwo: "Direct WhatsApp enquiries",
    benefitThree: "Simple job management",
    login: "Log in",
    register: "Create account",
    welcome: "Welcome back",
    welcomeBody: "Log in to manage your job posts.",
    create: "Create an employer account",
    createBody: "Set up your company profile and post your first job.",
    email: "Work email",
    password: "Password",
    company: "Company name",
    contact: "Contact person",
    phone: "WhatsApp number",
    remember: "Remember me",
    forgot: "Forgot password?",
    resetTitle: "Reset your password",
    resetBody: "Enter your work email and we will send you a secure reset link.",
    resetAction: "Send reset link",
    resetSent: "If an employer account exists for this email, a reset link has been sent.",
    resetRateLimit: "Too many reset emails have been requested. Please wait up to one hour and try again.",
    backToLogin: "Back to log in",
    passwordUpdated: "Password updated. Log in with your new password.",
    termsPrefix: "I agree to the",
    termsOfUse: "Terms of Use",
    termsAnd: "and",
    privacyPolicy: "Privacy Policy",
    loginAction: "Log in to dashboard",
    registerAction: "Create employer account",
    processing: "Please wait…",
    emailError: "Enter a valid work email.",
    passwordError: "Password must be at least 8 characters.",
    requiredError: "Complete all required fields.",
    termsError: "Please accept the terms to continue.",
    invalidLogin: "The email or password is incorrect.",
    confirmEmail: "Confirm your email before logging in.",
    authError: "We could not complete this request. Please try again.",
    checkEmail: "Account created. Check your email to confirm your account.",
    secure: "Your details are protected and never shown on job listings.",
  },
  ms: {
    back: "Kembali ke kerja",
    employer: "Akses majikan",
    title: "Cari pekerja dengan lebih pantas",
    intro: "Iklankan kerja secara percuma dan terima pertanyaan terus melalui WhatsApp.",
    benefitOne: "Iklan kerja percuma",
    benefitTwo: "Pertanyaan WhatsApp terus",
    benefitThree: "Pengurusan kerja mudah",
    login: "Log masuk",
    register: "Daftar akaun",
    welcome: "Selamat kembali",
    welcomeBody: "Log masuk untuk mengurus iklan kerja anda.",
    create: "Cipta akaun majikan",
    createBody: "Sediakan profil syarikat dan iklankan kerja pertama anda.",
    email: "E-mel kerja",
    password: "Kata laluan",
    company: "Nama syarikat",
    contact: "Nama pegawai",
    phone: "Nombor WhatsApp",
    remember: "Ingat saya",
    forgot: "Lupa kata laluan?",
    resetTitle: "Tetapkan semula kata laluan",
    resetBody: "Masukkan e-mel kerja anda dan kami akan menghantar pautan tetapan semula yang selamat.",
    resetAction: "Hantar pautan tetapan semula",
    resetSent: "Jika akaun majikan wujud untuk e-mel ini, pautan tetapan semula telah dihantar.",
    resetRateLimit: "Terlalu banyak e-mel tetapan semula telah diminta. Tunggu sehingga satu jam dan cuba lagi.",
    backToLogin: "Kembali ke log masuk",
    passwordUpdated: "Kata laluan dikemas kini. Log masuk dengan kata laluan baharu.",
    termsPrefix: "Saya bersetuju dengan",
    termsOfUse: "Terma Penggunaan",
    termsAnd: "dan",
    privacyPolicy: "Dasar Privasi",
    loginAction: "Log masuk ke dashboard",
    registerAction: "Cipta akaun majikan",
    processing: "Sila tunggu…",
    emailError: "Masukkan e-mel kerja yang sah.",
    passwordError: "Kata laluan mestilah sekurang-kurangnya 8 aksara.",
    requiredError: "Lengkapkan semua ruangan wajib.",
    termsError: "Sila terima terma untuk meneruskan.",
    invalidLogin: "E-mel atau kata laluan tidak betul.",
    confirmEmail: "Sahkan e-mel anda sebelum log masuk.",
    authError: "Permintaan ini tidak dapat diselesaikan. Sila cuba lagi.",
    checkEmail: "Akaun telah dicipta. Semak e-mel untuk mengesahkan akaun.",
    secure: "Maklumat anda dilindungi dan tidak dipaparkan pada iklan kerja.",
  },
} as const;

export function EmployerAuth({ initialLocale = "en", passwordResetSuccess = false }: { initialLocale?: Locale; passwordResetSuccess?: boolean }) {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(passwordResetSuccess ? copy[initialLocale].passwordUpdated : "");
  const t = copy[locale];

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError("");
    setMessage("");
  }

  function setLanguage(nextLocale: Locale) {
    setLocale(nextLocale);
    document.documentElement.lang = nextLocale;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") || "").trim();
    const password = String(data.get("password") || "");

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError(t.emailError);
      return;
    }
    if (mode !== "forgot" && password.length < 8) {
      setError(t.passwordError);
      return;
    }
    if (mode === "register") {
      const required = ["company", "contact", "phone"].every((field) => String(data.get(field) || "").trim());
      if (!required) {
        setError(t.requiredError);
        return;
      }
    }
    if (mode !== "login" && data.get("terms") !== "on") {
      setError(t.termsError);
      return;
    }

    setError("");
    setMessage("");
    setBusy(true);

    const supabase = createClient();

    try {
      if (mode === "forgot") {
        const recoveryUrl = new URL("/auth/recovery", window.location.origin);
        const recoveryClient = createRecoveryClient();
        const { error: recoveryError } = await recoveryClient.auth.resetPasswordForEmail(email, { redirectTo: recoveryUrl.toString() });
        if (recoveryError) {
          const normalized = recoveryError.message.toLowerCase();
          setError(normalized.includes("rate limit") || normalized.includes("too many") ? t.resetRateLimit : t.authError);
          return;
        }
        setMessage(t.resetSent);
        return;
      }

      if (mode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

        if (signInError) {
          const normalized = signInError.message.toLowerCase();
          setError(normalized.includes("email not confirmed") ? t.confirmEmail : normalized.includes("invalid login") ? t.invalidLogin : t.authError);
          return;
        }

        router.push(`/employer/dashboard?lang=${locale}`);
        router.refresh();
        return;
      }

      const company = String(data.get("company") || "").trim();
      const contact = String(data.get("contact") || "").trim();
      const phone = String(data.get("phone") || "").trim();
      const confirmUrl = new URL("/auth/confirm", window.location.origin);
      confirmUrl.searchParams.set("next", `/employer/dashboard?lang=${locale}`);

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: confirmUrl.toString(),
          data: {
            company_name: company,
            contact_name: contact,
            phone,
            terms_accepted: true,
            terms_version: TERMS_VERSION,
            privacy_accepted: true,
            privacy_version: PRIVACY_VERSION,
            legal_locale: locale,
          },
        },
      });

      if (signUpError) {
        setError(t.authError);
        return;
      }

      if (signUpData.session && signUpData.user) {
        const { error: companyError } = await supabase.from("companies").upsert({
          owner_id: signUpData.user.id,
          name: company,
          phone,
          email,
          updated_at: new Date().toISOString(),
        }, { onConflict: "owner_id" });

        if (companyError) {
          setError(t.authError);
          return;
        }

        router.push(`/employer/dashboard?lang=${locale}`);
        router.refresh();
        return;
      }

      setMessage(t.checkEmail);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <header className="auth-header">
        <div className="auth-header-inner">
          <Link className="wordmark" href="/">Job<span>Linker</span></Link>
          <div className="auth-language" aria-label="Language selector">
            <button type="button" aria-pressed={locale === "en"} onClick={() => setLanguage("en")}>EN</button>
            <span>|</span>
            <button type="button" aria-pressed={locale === "ms"} onClick={() => setLanguage("ms")}>BM</button>
          </div>
        </div>
      </header>

      <div className="auth-layout">
        <section className="auth-context">
          <Link className="back-link" href="/"><ArrowLeftIcon size={17} />{t.back}</Link>
          <div className="auth-context-copy">
            <p className="auth-eyebrow"><BriefcaseIcon size={17} weight="fill" />{t.employer}</p>
            <h1>{t.title}</h1>
            <p>{t.intro}</p>
            <ul>
              {[t.benefitOne, t.benefitTwo, t.benefitThree].map((item) => (
                <li key={item}><CheckCircleIcon size={19} weight="fill" />{item}</li>
              ))}
            </ul>
          </div>
          <div className="auth-whatsapp-note"><WhatsappLogoIcon size={22} />WhatsApp-first hiring for Malaysian SMEs</div>
        </section>

        <section className="auth-form-section">
          <div className="auth-card">
            {mode === "forgot" ? <button className="auth-reset-back" type="button" onClick={() => changeMode("login")}><ArrowLeftIcon size={16} />{t.backToLogin}</button> : (
              <div className="auth-tabs" role="tablist" aria-label="Employer account">
                <button type="button" role="tab" aria-selected={mode === "login"} onClick={() => changeMode("login")}>{t.login}</button>
                <button type="button" role="tab" aria-selected={mode === "register"} onClick={() => changeMode("register")}>{t.register}</button>
              </div>
            )}

            <div className="auth-card-heading">
              <h2>{mode === "login" ? t.welcome : mode === "register" ? t.create : t.resetTitle}</h2>
              <p>{mode === "login" ? t.welcomeBody : mode === "register" ? t.createBody : t.resetBody}</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              {mode === "register" && (
                <>
                  <label><span>{t.company}</span><input name="company" autoComplete="organization" required /></label>
                  <div className="auth-two-column">
                    <label><span>{t.contact}</span><input name="contact" autoComplete="name" required /></label>
                    <label><span>{t.phone}</span><input name="phone" type="tel" inputMode="tel" placeholder="6012 345 6789" autoComplete="tel" required /></label>
                  </div>
                </>
              )}

              <label><span>{t.email}</span><input name="email" type="email" inputMode="email" autoComplete="email" placeholder="name@company.com" required /></label>
              {mode !== "forgot" && <label>
                <span>{t.password}</span>
                <div className="password-field">
                  <LockKeyIcon size={19} aria-hidden="true" />
                  <input name="password" type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={8} />
                  <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((visible) => !visible)}>
                    {showPassword ? <EyeSlashIcon size={20} /> : <EyeIcon size={20} />}
                  </button>
                </div>
              </label>}

              {mode === "login" ? (
                <div className="auth-form-meta">
                  <label className="check-label"><input name="remember" type="checkbox" /><span>{t.remember}</span></label>
                  <button type="button" onClick={() => changeMode("forgot")}>{t.forgot}</button>
                </div>
              ) : (
                <label className="check-label terms"><input name="terms" type="checkbox" required /><span>{t.termsPrefix} <Link href={`/terms?lang=${locale}`} target="_blank">{t.termsOfUse}</Link> {t.termsAnd} <Link href={`/privacy?lang=${locale}`} target="_blank">{t.privacyPolicy}</Link>.</span></label>
              )}

              {error && <p className="auth-error" role="alert">{error}</p>}
              {message && <p className="auth-success" role="status">{message}</p>}

              <button className="auth-submit" type="submit" disabled={busy}>
                {busy ? t.processing : mode === "login" ? t.loginAction : mode === "register" ? t.registerAction : t.resetAction}
              </button>
            </form>
            <p className="auth-secure"><LockKeyIcon size={15} weight="fill" />{t.secure}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
