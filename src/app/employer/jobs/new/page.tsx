import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { JobPostForm } from "@/components/job-post-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Post a job | JobLinker",
  description: "Create a JobLinker job listing and receive worker enquiries through WhatsApp.",
};

export default async function NewJobPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/employer/login");

  const { data: company } = await supabase
    .from("companies")
    .select("id,name,logo_path,verification_status,account_status")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!company) redirect("/employer/company");
  if (company.account_status === "suspended") redirect("/employer/dashboard?account=suspended");

  const companyLogoUrl = company.logo_path
    ? supabase.storage.from("company-logos").getPublicUrl(company.logo_path).data.publicUrl
    : null;

  const { lang } = await searchParams;
  return (
    <JobPostForm
      initialLocale={lang === "ms" ? "ms" : "en"}
      userId={user.id}
      companyId={company.id}
      companyName={company.name}
      companyLogoUrl={companyLogoUrl}
      companyVerified={company.verification_status === "verified"}
    />
  );
}
