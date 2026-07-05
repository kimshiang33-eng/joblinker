"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CircleNotchIcon, LockKeyIcon } from "@phosphor-icons/react";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export function RecoveryCallback() {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;

    async function establishRecoverySession() {
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(url.hash.slice(1));
      const code = url.searchParams.get("code");
      const tokenHash = url.searchParams.get("token_hash");
      const type = (url.searchParams.get("type") ?? "recovery") as EmailOtpType;
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      const supabase = createClient();

      let error: Error | null = null;

      if (code) {
        ({ error } = await supabase.auth.exchangeCodeForSession(code));
      } else if (tokenHash) {
        ({ error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash }));
      } else if (accessToken && refreshToken) {
        ({ error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        }));
      } else {
        error = new Error(hash.get("error_description") ?? "Missing recovery credentials");
      }

      if (!active) return;

      if (error) {
        console.error("[auth/recovery] unable to establish recovery session", {
          message: error.message,
        });
        setFailed(true);
        return;
      }

      window.location.replace("/employer/reset-password");
    }

    void establishRecoverySession();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="auth-page reset-password-page">
      <header className="auth-header">
        <div className="auth-header-inner">
          <Link className="wordmark" href="/">Job<span>Linker</span></Link>
        </div>
      </header>
      <div className="reset-password-shell">
        <section className="auth-card reset-password-card">
          <div className="reset-password-icon">
            {failed ? <LockKeyIcon size={27} weight="fill" /> : <CircleNotchIcon size={27} className="recovery-spinner" />}
          </div>
          <div className="auth-card-heading">
            <p className="auth-eyebrow">Employer security</p>
            <h1>{failed ? "Reset link unavailable" : "Checking your reset link"}</h1>
            <p>{failed ? "This link is invalid or has expired. Request a new password reset email." : "Please wait while we verify your secure recovery session."}</p>
          </div>
          {failed && <Link className="auth-submit recovery-return" href="/employer/login">Request a new link</Link>}
        </section>
      </div>
    </main>
  );
}
