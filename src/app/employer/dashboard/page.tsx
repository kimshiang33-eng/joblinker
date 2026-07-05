import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EmployerDashboard, type EmployerJob, type EmployerNotification } from "@/components/employer-dashboard";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Employer dashboard | JobLinker",
  description: "Manage JobLinker job posts, views, and WhatsApp enquiries.",
};

export default async function EmployerDashboardPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/employer/login");

  const { data: company } = await supabase
    .from("companies")
    .select("id,name,logo_path,verification_status,account_status,suspension_reason")
    .eq("owner_id", user.id)
    .maybeSingle();

  const metadataCompany = user.user_metadata.company_name;
  const companyName = company?.name
    ?? (typeof metadataCompany === "string" && metadataCompany.trim() ? metadataCompany.trim() : "Your company");
  const companyLogoUrl = company?.logo_path
    ? supabase.storage.from("company-logos").getPublicUrl(company.logo_path).data.publicUrl
    : null;

  const [{ data: jobRows }, { data: notificationRows }] = company
    ? await Promise.all([supabase
      .from("jobs")
      .select("id,reference_code,title_en,title_ms,location,state,salary_min,salary_max,salary_unit,review_status,listing_status,moderation_status,moderation_reason,expires_at,views,whatsapp_clicks,created_at,featured")
      .eq("company_id", company.id)
      .order("created_at", { ascending: false }), supabase
      .from("employer_notifications")
      .select("id,type,title_en,title_ms,body_en,body_ms,href,read_at,created_at")
      .order("created_at", { ascending: false })
      .limit(20)])
    : [{ data: [] }, { data: [] }];

  const initialJobs: EmployerJob[] = (jobRows ?? []).map((job) => {
    const status: EmployerJob["status"] = job.review_status === "pending"
      ? "pending"
      : job.review_status === "rejected"
        ? "rejected"
        : job.moderation_status === "suspended"
          ? "suspended"
        : job.listing_status === "paused"
          ? "paused"
          : job.listing_status === "closed"
            ? "closed"
            : "active";

    return {
      id: job.id,
      referenceCode: job.reference_code,
      title: { en: job.title_en, ms: job.title_ms },
      salaryMin: job.salary_min,
      salaryMax: job.salary_max,
      salaryUnit: job.salary_unit,
      location: job.location,
      state: job.state,
      status,
      listingStatus: job.listing_status,
      views: Number(job.views),
      clicks: Number(job.whatsapp_clicks),
      createdAt: job.created_at,
      boosted: job.featured,
      moderationStatus: job.moderation_status,
      moderationReason: job.moderation_reason,
      expiresAt: job.expires_at,
    } as EmployerJob;
  });

  const initialNotifications: EmployerNotification[] = (notificationRows ?? []).map((notification) => ({
    id: String(notification.id),
    type: notification.type,
    title: { en: notification.title_en, ms: notification.title_ms },
    body: { en: notification.body_en, ms: notification.body_ms },
    href: notification.href,
    readAt: notification.read_at,
    createdAt: notification.created_at,
  }));

  const { lang } = await searchParams;
  return <EmployerDashboard initialLocale={lang === "ms" ? "ms" : "en"} companyName={companyName} companyLogoUrl={companyLogoUrl} companyVerificationStatus={company?.verification_status ?? "unverified"} companyAccountStatus={company?.account_status ?? "active"} suspensionReason={company?.suspension_reason ?? null} initialJobs={initialJobs} initialNotifications={initialNotifications} />;
}
