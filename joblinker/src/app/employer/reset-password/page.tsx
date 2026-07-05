import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Reset employer password | JobLinker",
  description: "Choose a new password for your JobLinker employer account.",
};

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/employer/login");

  const { lang } = await searchParams;
  return <ResetPasswordForm initialLocale={lang === "ms" ? "ms" : "en"} />;
}
