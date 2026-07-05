import { JobBoard } from "@/components/job-board";
import { getPublicJobs } from "@/lib/public-jobs";

export const dynamic = "force-dynamic";

export default async function Home() {
  const jobs = await getPublicJobs();
  return <JobBoard initialJobs={jobs} />;
}
