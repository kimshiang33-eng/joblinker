import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminPanel, type AdminAuditLog, type AdminEmployer, type AdminJob } from "@/components/admin-panel";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin panel | JobLinker",
  description: "Review JobLinker listings and monitor job-board activity.",
};

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: admin } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) redirect("/admin/login?error=access");

  const [{ data: jobRows, error: jobsError }, { data: companyRows, error: companiesError }, { data: auditRows, error: auditError }] = await Promise.all([
    supabase
      .from("jobs")
      .select("id,reference_code,company_id,title_en,title_ms,category,location,state,salary_min,salary_max,salary_unit,description_en,description_ms,whatsapp,created_at,review_status,views,whatsapp_clicks,featured,rejection_reason,moderation_status,moderation_reason,expires_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("companies")
      .select("id,name,registration_number,industry,company_size,website,phone,email,address,city,state,verification_status,account_status,suspension_reason,created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("admin_audit_log")
      .select("id,action,target_type,target_id,detail,created_at")
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  const companyNames = new Map((companyRows ?? []).map((company) => [company.id, company.name]));
  const salaryPeriod = (unit: string) => ({ month: "month", day: "day", hour: "hour" })[unit] ?? unit;
  const initialJobs: AdminJob[] = (jobRows ?? []).map((job) => ({
    id: job.id,
    referenceCode: job.reference_code,
    title: { en: job.title_en, ms: job.title_ms },
    company: companyNames.get(job.company_id) ?? "Unknown company",
    salary: `RM${Number(job.salary_min).toLocaleString("en-MY")}–RM${Number(job.salary_max).toLocaleString("en-MY")} / ${salaryPeriod(job.salary_unit)}`,
    location: `${job.location}, ${job.state}`,
    category: job.category,
    description: { en: job.description_en, ms: job.description_ms },
    whatsapp: job.whatsapp,
    submitted: new Intl.DateTimeFormat("en-MY", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kuala_Lumpur" }).format(new Date(job.created_at)),
    status: job.review_status,
    views: Number(job.views),
    clicks: Number(job.whatsapp_clicks),
    featured: job.featured,
    rejectReason: job.rejection_reason ?? undefined,
    moderationStatus: job.moderation_status,
    moderationReason: job.moderation_reason ?? undefined,
    expiresAt: job.expires_at,
  }));

  const jobCounts = new Map<string, { total: number; approved: number }>();
  for (const job of jobRows ?? []) {
    const current = jobCounts.get(job.company_id) ?? { total: 0, approved: 0 };
    current.total += 1;
    if (job.review_status === "approved") current.approved += 1;
    jobCounts.set(job.company_id, current);
  }

  const initialEmployers: AdminEmployer[] = (companyRows ?? []).map((company) => ({
    id: company.id,
    name: company.name,
    registrationNumber: company.registration_number,
    industry: company.industry,
    companySize: company.company_size,
    website: company.website,
    phone: company.phone,
    email: company.email,
    address: company.address,
    city: company.city,
    state: company.state,
    verificationStatus: company.verification_status,
    accountStatus: company.account_status,
    suspensionReason: company.suspension_reason,
    createdAt: company.created_at,
    jobCount: jobCounts.get(company.id)?.total ?? 0,
    approvedJobCount: jobCounts.get(company.id)?.approved ?? 0,
  }));

  const initialAuditLogs: AdminAuditLog[] = (auditRows ?? []).map((entry) => ({
    id: String(entry.id),
    action: entry.action,
    targetType: entry.target_type,
    targetId: entry.target_id,
    detail: (entry.detail ?? {}) as Record<string, unknown>,
    createdAt: entry.created_at,
  }));

  return (
    <AdminPanel
      initialJobs={initialJobs}
      initialEmployers={initialEmployers}
      initialAuditLogs={initialAuditLogs}
      adminEmail={user.email ?? "Admin"}
      initialLoadError={jobsError?.message ?? companiesError?.message ?? auditError?.message ?? null}
    />
  );
}
