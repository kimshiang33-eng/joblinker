import "server-only";

import { cache } from "react";
import type { Job, JobCategory, LocalizedText } from "@/data/jobs";
import { createClient } from "@/lib/supabase/server";

type PublicJobRow = {
  id: string;
  reference_code: string;
  company_id: string;
  company_name: string;
  company_logo_path: string | null;
  company_verification_status: string;
  title_en: string;
  title_ms: string;
  category: string;
  location: string;
  state: string;
  salary_min: number;
  salary_max: number;
  salary_unit: "month" | "day" | "hour";
  work_type: "full-time" | "part-time" | "contract";
  description_en: string;
  description_ms: string;
  requirements_en: string;
  requirements_ms: string;
  whatsapp: string;
  vacancies: number;
  urgent: boolean;
  featured: boolean;
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
};

const salaryUnits: Record<PublicJobRow["salary_unit"], LocalizedText> = {
  month: { en: "month", ms: "bulan" },
  day: { en: "day", ms: "hari" },
  hour: { en: "hour", ms: "jam" },
};

const workTypes: Record<PublicJobRow["work_type"], LocalizedText> = {
  "full-time": { en: "Full-time", ms: "Sepenuh masa" },
  "part-time": { en: "Part-time", ms: "Separuh masa" },
  contract: { en: "Contract", ms: "Kontrak" },
};

function splitList(value: string) {
  return value
    .split(/\r?\n|;/)
    .map((item) => item.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean);
}

function companyInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("") || "JL";
}

function mapPublicJob(row: PublicJobRow, companyLogoUrl?: string): Job {
  const salaryRange = `RM${Number(row.salary_min).toLocaleString("en-MY")}–RM${Number(row.salary_max).toLocaleString("en-MY")}`;
  const publishedAt = new Date(row.published_at ?? row.created_at).getTime();
  const postedHours = Math.max(1, Math.floor((Date.now() - publishedAt) / 3_600_000));

  return {
    id: row.id,
    referenceCode: row.reference_code,
    title: { en: row.title_en, ms: row.title_ms },
    salary: {
      en: `${salaryRange} / ${salaryUnits[row.salary_unit].en}`,
      ms: `${salaryRange} / ${salaryUnits[row.salary_unit].ms}`,
    },
    salaryMin: Number(row.salary_min),
    salaryMax: Number(row.salary_max),
    salaryUnit: row.salary_unit,
    company: row.company_name,
    companyLogoUrl,
    location: `${row.location}, ${row.state}`,
    category: row.category as JobCategory,
    initials: companyInitials(row.company_name),
    whatsapp: row.whatsapp,
    postedHours,
    publishedAt: row.published_at ?? row.created_at,
    expiresAt: row.expires_at ?? undefined,
    featured: row.featured,
    urgent: row.urgent,
    verified: row.company_verification_status === "verified",
    employmentType: workTypes[row.work_type],
    employmentTypeCode: row.work_type,
    schedule: { en: "Contact employer for schedule", ms: "Hubungi majikan untuk jadual" },
    vacancies: Number(row.vacancies),
    description: { en: row.description_en, ms: row.description_ms },
    responsibilities: { en: [], ms: [] },
    requirements: { en: splitList(row.requirements_en), ms: splitList(row.requirements_ms) },
    benefits: { en: [], ms: [] },
  };
}

export const getPublicJobs = cache(async (jobReference?: string): Promise<Job[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_jobs", { target_job_reference: jobReference ?? null });
  if (error) {
    console.error("Unable to load public jobs:", error.message);
    return [];
  }
  return ((data ?? []) as PublicJobRow[]).map((row) => {
    const companyLogoUrl = row.company_logo_path
      ? supabase.storage.from("company-logos").getPublicUrl(row.company_logo_path).data.publicUrl
      : undefined;
    return mapPublicJob(row, companyLogoUrl);
  });
});
