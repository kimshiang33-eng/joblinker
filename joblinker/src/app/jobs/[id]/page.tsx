import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JobDetail } from "@/components/job-detail";
import { getPublicJobs } from "@/lib/public-jobs";

type PageProps = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const [job] = await getPublicJobs(id);
  if (!job) return { title: "Job not found | JobLinker" };
  return {
    title: `${job.title.en} at ${job.company} | JobLinker`,
    description: `${job.salary.en}. ${job.location}. ${job.description.en}`,
  };
}

export default async function JobPage({ params }: PageProps) {
  const { id } = await params;
  const [job] = await getPublicJobs(id);
  if (!job) notFound();
  const relatedJobs = (await getPublicJobs()).filter((item) => item.id !== job.id && item.category === job.category).slice(0, 2);
  const employmentType = {
    "full-time": "FULL_TIME",
    "part-time": "PART_TIME",
    contract: "CONTRACTOR",
  }[job.employmentTypeCode ?? "full-time"];
  const salaryUnit = { month: "MONTH", day: "DAY", hour: "HOUR" }[job.salaryUnit ?? "month"];
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title.en,
    description: job.description.en,
    datePosted: job.publishedAt,
    validThrough: job.expiresAt,
    employmentType,
    hiringOrganization: { "@type": "Organization", name: job.company },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: job.location, addressCountry: "MY" },
    },
    baseSalary: {
      "@type": "MonetaryAmount",
      currency: "MYR",
      value: { "@type": "QuantitativeValue", minValue: job.salaryMin, maxValue: job.salaryMax, unitText: salaryUnit },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <JobDetail job={job} relatedJobs={relatedJobs} />
    </>
  );
}
