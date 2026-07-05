import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CompanyProfile, type CompanyProfileRecord } from "@/components/company-profile";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Company profile | JobLinker",
  description: "Manage the company information shown across JobLinker job listings.",
};

export default async function CompanyProfilePage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/employer/login");

  const { data } = await supabase
    .from("companies")
    .select("id,name,registration_number,industry,company_size,website,phone,email,address,city,state,description_en,description_ms,logo_path,verification_status")
    .eq("owner_id", user.id)
    .maybeSingle();

  const metadataCompany = user.user_metadata.company_name;
  const company = (data ?? {
    id: "",
    name: typeof metadataCompany === "string" && metadataCompany.trim() ? metadataCompany.trim() : "Your company",
    registration_number: null,
    industry: null,
    company_size: null,
    website: null,
    phone: typeof user.user_metadata.phone === "string" ? user.user_metadata.phone : null,
    email: user.email ?? null,
    address: null,
    city: null,
    state: null,
    description_en: null,
    description_ms: null,
    logo_path: null,
    verification_status: "unverified",
  }) as CompanyProfileRecord;

  const { lang } = await searchParams;
  return <CompanyProfile initialLocale={lang === "ms" ? "ms" : "en"} ownerId={user.id} initialCompany={company} />;
}
