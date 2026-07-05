import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EmployerAuth } from "@/components/employer-auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Employer login | JobLinker",
  description: "Log in or create a JobLinker employer account to post jobs and hire workers through WhatsApp.",
};

export default async function EmployerLoginPage({ searchParams }: { searchParams: Promise<{ reset?: string; lang?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) redirect("/employer/dashboard");

  const { reset, lang } = await searchParams;
  return <EmployerAuth initialLocale={lang === "ms" ? "ms" : "en"} passwordResetSuccess={reset === "success"} />;
}
