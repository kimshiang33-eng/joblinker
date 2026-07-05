"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowSquareOutIcon,
  ArrowClockwiseIcon,
  BriefcaseIcon,
  ChartBarIcon,
  CheckCircleIcon,
  CopyIcon,
  EyeIcon,
  GearIcon,
  HouseIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  NotePencilIcon,
  PauseCircleIcon,
  PlusIcon,
  RocketLaunchIcon,
  SignOutIcon,
  TrashIcon,
  TrendUpIcon,
  WhatsappLogoIcon,
  XIcon,
} from "@phosphor-icons/react";
import type { Locale, LocalizedText } from "@/data/jobs";
import { createClient } from "@/lib/supabase/client";

type EmployerJobStatus = "active" | "pending" | "paused" | "rejected" | "closed" | "suspended" | "expired";
type StatusFilter = "all" | EmployerJobStatus;

export type EmployerJob = {
  id: string;
  referenceCode?: string;
  title: LocalizedText;
  salaryMin: number;
  salaryMax: number;
  salaryUnit: "month" | "day" | "hour";
  location: string;
  state: string;
  status: EmployerJobStatus;
  listingStatus: "active" | "paused" | "closed";
  views: number;
  clicks: number;
  createdAt: string;
  boosted: boolean;
  moderationStatus: "active" | "suspended";
  moderationReason: string | null;
  expiresAt: string | null;
};

export type EmployerNotification = {
  id: string;
  type: string;
  title: LocalizedText;
  body: LocalizedText;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};

export const legacyMockJobs = [
  {
    id: "JL-1001",
    title: { en: "Production Operator", ms: "Operator Pengeluaran" },
    salary: { en: "RM1,800–RM2,400 / month", ms: "RM1,800–RM2,400 / bulan" },
    location: "Shah Alam, Selangor",
    status: "active",
    views: 384,
    clicks: 67,
    posted: "26 Jun 2026",
    boosted: true,
  },
  {
    id: "JL-1014",
    title: { en: "Warehouse Assistant", ms: "Pembantu Gudang" },
    salary: { en: "RM1,500–RM1,900 / month", ms: "RM1,500–RM1,900 / bulan" },
    location: "Klang, Selangor",
    status: "active",
    views: 226,
    clicks: 39,
    posted: "27 Jun 2026",
  },
  {
    id: "JL-1022",
    title: { en: "Quality Control Inspector", ms: "Pemeriksa Kawalan Kualiti" },
    salary: { en: "RM2,100–RM2,700 / month", ms: "RM2,100–RM2,700 / bulan" },
    location: "Johor Bahru, Johor",
    status: "pending",
    views: 0,
    clicks: 0,
    posted: "28 Jun 2026",
  },
] as const;

const copy = {
  en: {
    overview: "Overview",
    jobs: "My jobs",
    analytics: "Analytics",
    company: "Company profile",
    logout: "Log out",
    employer: "Employer dashboard",
    intro: "Track your jobs and respond to interested workers quickly.",
    post: "Post a new job",
    activeJobs: "Active jobs",
    totalViews: "Total views",
    whatsappClicks: "WhatsApp clicks",
    conversion: "Click rate",
    thisMonth: "This month",
    fromViews: "of job views",
    jobsTitle: "Your job posts",
    jobsBody: "Manage listings and monitor hiring interest.",
    search: "Search your jobs",
    all: "All",
    active: "Active",
    pending: "Pending approval",
    paused: "Paused",
    rejected: "Rejected",
    closed: "Closed",
    suspended: "Taken down",
    expired: "Expired",
    views: "views",
    clicks: "WhatsApp clicks",
    posted: "Posted",
    edit: "Edit",
    pause: "Pause",
    resume: "Resume",
    delete: "Delete",
    boost: "Boost job",
    boosted: "Boosted",
    verified: "Verified employer",
    preview: "View listing",
    empty: "No jobs match this filter.",
    editTitle: "Edit job",
    jobTitle: "Job title",
    salaryMin: "Minimum salary",
    salaryMax: "Maximum salary",
    actionError: "The job could not be updated. Please try again.",
    cancel: "Cancel",
    save: "Save changes",
    deleteTitle: "Delete this job?",
    deleteBody: "This removes the listing from your dashboard. This action cannot be undone.",
    confirmDelete: "Delete job",
    boostTitle: "Boost this job",
    boostBody: "Boosted jobs appear above regular listings. Payment will be connected in a later milestone.",
    confirmBoost: "Understood",
    createTitle: "New job post is next",
    createBody: "The guided job-posting form will be built in the next step.",
    continue: "Understood",
    accountSuspended: "Employer account suspended",
    cannotPost: "You cannot post new jobs while this account is suspended.",
    notifications: "Notifications",
    notificationsBody: "Updates from JobLinker operations.",
    markRead: "Mark as read",
    noNotifications: "No notifications yet.",
    expires: "Expires",
    copy: "Copy",
    close: "Close",
    repost: "Repost",
    extend: "Extend 30 days",
    expiringSoon: "Expires soon",
    jobActionError: "The job action could not be completed.",
  },
  ms: {
    overview: "Ringkasan",
    jobs: "Kerja saya",
    analytics: "Analitik",
    company: "Profil syarikat",
    logout: "Log keluar",
    employer: "Dashboard majikan",
    intro: "Pantau iklan kerja dan balas pekerja yang berminat dengan pantas.",
    post: "Iklankan kerja baharu",
    activeJobs: "Kerja aktif",
    totalViews: "Jumlah tontonan",
    whatsappClicks: "Klik WhatsApp",
    conversion: "Kadar klik",
    thisMonth: "Bulan ini",
    fromViews: "daripada tontonan",
    jobsTitle: "Iklan kerja anda",
    jobsBody: "Urus iklan dan pantau minat pekerja.",
    search: "Cari kerja anda",
    all: "Semua",
    active: "Aktif",
    pending: "Menunggu kelulusan",
    paused: "Dijeda",
    rejected: "Ditolak",
    closed: "Ditutup",
    suspended: "Diturunkan",
    expired: "Tamat tempoh",
    views: "tontonan",
    clicks: "klik WhatsApp",
    posted: "Diterbitkan",
    edit: "Edit",
    pause: "Jeda",
    resume: "Sambung",
    delete: "Padam",
    boost: "Boost kerja",
    boosted: "Diboost",
    verified: "Majikan disahkan",
    preview: "Lihat iklan",
    empty: "Tiada kerja sepadan dengan penapis ini.",
    editTitle: "Edit kerja",
    jobTitle: "Jawatan",
    salaryMin: "Gaji minimum",
    salaryMax: "Gaji maksimum",
    actionError: "Iklan kerja tidak dapat dikemas kini. Sila cuba lagi.",
    cancel: "Batal",
    save: "Simpan perubahan",
    deleteTitle: "Padam kerja ini?",
    deleteBody: "Iklan ini akan dibuang daripada dashboard anda. Tindakan ini tidak boleh dibatalkan.",
    confirmDelete: "Padam kerja",
    boostTitle: "Boost kerja ini",
    boostBody: "Kerja yang diboost muncul di atas iklan biasa. Pembayaran akan disambungkan kemudian.",
    confirmBoost: "Faham",
    createTitle: "Iklan kerja baharu ialah langkah seterusnya",
    createBody: "Borang iklan kerja berpanduan akan dibina dalam langkah seterusnya.",
    continue: "Faham",
    accountSuspended: "Akaun majikan digantung",
    cannotPost: "Anda tidak boleh mengiklankan kerja baharu semasa akaun digantung.",
    notifications: "Notifikasi",
    notificationsBody: "Kemas kini daripada operasi JobLinker.",
    markRead: "Tandakan dibaca",
    noNotifications: "Belum ada notifikasi.",
    expires: "Tamat",
    copy: "Salin",
    close: "Tutup",
    repost: "Iklankan semula",
    extend: "Lanjut 30 hari",
    expiringSoon: "Akan tamat",
    jobActionError: "Tindakan kerja tidak dapat diselesaikan.",
  },
} as const;

type ModalState =
  | { type: "edit"; job: EmployerJob }
  | { type: "delete"; job: EmployerJob }
  | { type: "boost"; job: EmployerJob }
  | null;

export function EmployerDashboard({ initialLocale, companyName, companyLogoUrl, companyVerificationStatus, companyAccountStatus, suspensionReason, initialJobs, initialNotifications }: { initialLocale: Locale; companyName: string; companyLogoUrl: string | null; companyVerificationStatus: string; companyAccountStatus: string; suspensionReason: string | null; initialJobs: EmployerJob[]; initialNotifications: EmployerNotification[] }) {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [jobs, setJobs] = useState(initialJobs);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [modal, setModal] = useState<ModalState>(null);
  const [actionError, setActionError] = useState("");
  const [notifications, setNotifications] = useState(initialNotifications);
  const [currentTime, setCurrentTime] = useState<number | null>(null);
  const t = copy[locale];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const now = Date.now();
      setCurrentTime(now);
      setJobs((current) => current.map((job) => job.expiresAt && new Date(job.expiresAt).getTime() <= now && job.status === "active" ? { ...job, status: "expired" } : job));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const companyInitials = companyName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("") || "CO";

  const metrics = useMemo(() => {
    const active = jobs.filter((job) => job.status === "active").length;
    const views = jobs.reduce((sum, job) => sum + job.views, 0);
    const clicks = jobs.reduce((sum, job) => sum + job.clicks, 0);
    const rate = views ? Math.round((clicks / views) * 100) : 0;
    return { active, views, clicks, rate };
  }, [jobs]);

  const visibleJobs = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesStatus = status === "all" || job.status === status;
      const haystack = `${job.title.en} ${job.title.ms} ${job.location} ${job.referenceCode ?? job.id}`.toLowerCase();
      return matchesStatus && (!needle || haystack.includes(needle));
    });
  }, [jobs, query, status]);

  const statusLabel = (jobStatus: EmployerJobStatus) => t[jobStatus];

  const salaryLabel = (job: EmployerJob) => {
    const period = locale === "ms" ? { month: "bulan", day: "hari", hour: "jam" }[job.salaryUnit] : job.salaryUnit;
    return `RM${job.salaryMin.toLocaleString("en-MY")}–RM${job.salaryMax.toLocaleString("en-MY")} / ${period}`;
  };

  const postedLabel = (createdAt: string) => new Intl.DateTimeFormat(locale === "ms" ? "ms-MY" : "en-MY", { dateStyle: "medium" }).format(new Date(createdAt));

  const jobReference = (job: EmployerJob) => job.referenceCode ?? job.id;

  async function markNotificationRead(notificationId: string) {
    const readAt = new Date().toISOString();
    const { error } = await createClient().from("employer_notifications").update({ read_at: readAt }).eq("id", notificationId);
    if (error) { setActionError(t.actionError); return; }
    setNotifications((current) => current.map((notification) => notification.id === notificationId ? { ...notification, readAt } : notification));
  }

  function changeLocale(nextLocale: Locale) {
    setLocale(nextLocale);
    document.documentElement.lang = nextLocale;
  }

  async function toggleJob(job: EmployerJob) {
    setActionError("");
    const listingStatus = job.listingStatus === "paused" ? "active" : "paused";
    const { error } = await createClient().from("jobs").update({ listing_status: listingStatus, updated_at: new Date().toISOString() }).eq("id", job.id);
    if (error) {
      setActionError(t.actionError);
      return;
    }
    setJobs((current) => current.map((item) => item.id === job.id
      ? { ...item, listingStatus, status: listingStatus === "paused" ? "paused" : "active" }
      : item));
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>, job: EmployerJob) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = String(data.get("title") || "").trim();
    const salaryMin = Number(data.get("salaryMin"));
    const salaryMax = Number(data.get("salaryMax"));
    if (!title || salaryMin < 1 || salaryMax <= salaryMin) return;
    const { data: updated, error } = await createClient().from("jobs").update({ title_en: title, title_ms: title, salary_min: salaryMin, salary_max: salaryMax, updated_at: new Date().toISOString() }).eq("id", job.id).select("review_status").single();
    if (error) {
      setActionError(t.actionError);
      setModal(null);
      return;
    }
    setJobs((current) => current.map((item) => item.id === job.id
      ? { ...item, title: { en: title, ms: title }, salaryMin, salaryMax, status: updated.review_status === "pending" ? "pending" : item.status }
      : item));
    setModal(null);
  }

  async function deleteJob(jobId: string) {
    const { error } = await createClient().from("jobs").delete().eq("id", jobId);
    if (error) {
      setActionError(t.actionError);
      setModal(null);
      return;
    }
    setJobs((current) => current.filter((job) => job.id !== jobId));
    setModal(null);
  }

  async function closeJob(job: EmployerJob) {
    setActionError("");
    const { error } = await createClient().from("jobs").update({ listing_status: "closed", updated_at: new Date().toISOString() }).eq("id", job.id);
    if (error) { setActionError(t.jobActionError); return; }
    setJobs((current) => current.map((item) => item.id === job.id ? { ...item, listingStatus: "closed", status: "closed" } : item));
  }

  async function runJobRpc(name: "employer_copy_job" | "employer_extend_job" | "employer_repost_job", job: EmployerJob) {
    setActionError("");
    const { error } = await createClient().rpc(name, { target_job_id: job.id });
    if (error) { setActionError(t.jobActionError); return; }
    window.location.reload();
  }

  async function logOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/employer/login");
    router.refresh();
  }

  return (
    <div className="employer-shell">
      <aside className="dashboard-sidebar">
        <Link className="wordmark" href="/">Job<span>Linker</span></Link>
        <p>{t.employer}</p>
        <nav aria-label="Employer navigation">
          <a className="active" href="#overview"><HouseIcon size={19} weight="fill" />{t.overview}</a>
          <a href="#jobs"><BriefcaseIcon size={19} />{t.jobs}</a>
          <a href="#analytics"><ChartBarIcon size={19} />{t.analytics}</a>
          <Link href={`/employer/company?lang=${locale}`}><GearIcon size={19} />{t.company}</Link>
        </nav>
        <button className="dashboard-logout" type="button" onClick={logOut}><SignOutIcon size={18} />{t.logout}</button>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <Link className="mobile-wordmark wordmark" href="/">Job<span>Linker</span></Link>
          <div className="dashboard-company"><span>{companyLogoUrl ? <Image src={companyLogoUrl} width={36} height={36} alt="" /> : companyInitials}</span><div><strong>{companyName}</strong><small>Employer account</small>{companyVerificationStatus === "verified" && <em className="employer-verified-badge"><CheckCircleIcon size={13} weight="fill" />{t.verified}</em>}</div></div>
          <div className="dashboard-language" aria-label="Language selector">
            <button type="button" aria-pressed={locale === "en"} onClick={() => changeLocale("en")}>EN</button><span>|</span>
            <button type="button" aria-pressed={locale === "ms"} onClick={() => changeLocale("ms")}>BM</button>
          </div>
        </header>

        <div className="dashboard-content">
          <section className="dashboard-intro" id="overview">
            <div><p>{t.employer}</p><h1>{locale === "en" ? `Good afternoon, ${companyName}` : `Selamat petang, ${companyName}`}</h1><span>{t.intro}</span></div>
            {companyAccountStatus === "active" && <Link href={`/employer/jobs/new?lang=${locale}`}><PlusIcon size={19} weight="bold" />{t.post}</Link>}
          </section>

          {companyAccountStatus === "suspended" && <section className="employer-suspension-banner"><strong>{t.accountSuspended}</strong><p>{suspensionReason || t.cannotPost}</p><span>{t.cannotPost}</span></section>}

          <section className="employer-notifications" id="notifications">
            <div className="manage-heading"><div><h2>{t.notifications}</h2><p>{t.notificationsBody}</p></div><span>{notifications.filter((item) => !item.readAt).length}</span></div>
            <div className="employer-notification-list">{notifications.length ? notifications.map((notification) => <article className={notification.readAt ? "read" : ""} key={notification.id}><div><strong>{notification.title[locale]}</strong><p>{notification.body[locale]}</p><time>{postedLabel(notification.createdAt)}</time></div>{!notification.readAt && <button type="button" onClick={() => markNotificationRead(notification.id)}>{t.markRead}</button>}</article>) : <div className="dashboard-empty">{t.noNotifications}</div>}</div>
          </section>

          <section className="metric-grid" id="analytics" aria-label={t.analytics}>
            <article><div><BriefcaseIcon size={20} /></div><p>{t.activeJobs}</p><strong>{metrics.active}</strong><span>{t.thisMonth}</span></article>
            <article><div><EyeIcon size={20} /></div><p>{t.totalViews}</p><strong>{metrics.views}</strong><span>{t.thisMonth}</span></article>
            <article><div><WhatsappLogoIcon size={20} /></div><p>{t.whatsappClicks}</p><strong>{metrics.clicks}</strong><span>{t.thisMonth}</span></article>
            <article><div><TrendUpIcon size={20} /></div><p>{t.conversion}</p><strong>{metrics.rate}%</strong><span>{t.fromViews}</span></article>
          </section>

          <section className="manage-jobs" id="jobs">
            <div className="manage-heading"><div><h2>{t.jobsTitle}</h2><p>{t.jobsBody}</p></div><span>{jobs.length}</span></div>
            <div className="manage-toolbar">
              <label><MagnifyingGlassIcon size={19} /><span className="sr-only">{t.search}</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} /></label>
              <div className="status-tabs" aria-label="Job status filter">
                {(["all", "active", "pending", "paused", "rejected", "closed", "suspended", "expired"] as StatusFilter[]).map((item) => (
                  <button type="button" key={item} aria-pressed={status === item} onClick={() => setStatus(item)}>{item === "all" ? t.all : t[item]}</button>
                ))}
              </div>
            </div>

            {actionError && <p className="dashboard-action-error" role="alert">{actionError}</p>}

            <div className="employer-job-list">
              {visibleJobs.length ? visibleJobs.map((job) => (
                <article className="employer-job" key={job.id}>
                  <div className="employer-job-main">
                    <div className="employer-job-title">
                      <div className="job-state-row"><span className={`job-state ${job.status}`}>{statusLabel(job.status)}</span>{companyVerificationStatus === "verified" && <span className="employer-verified-badge"><CheckCircleIcon size={13} weight="fill" />{t.verified}</span>}{job.boosted && <span className="boost-label"><RocketLaunchIcon size={14} weight="fill" />{t.boosted}</span>}{currentTime !== null && job.expiresAt && new Date(job.expiresAt).getTime() - currentTime < 7 * 86400000 && new Date(job.expiresAt).getTime() > currentTime && <span className="expiry-warning">{t.expiringSoon}</span>}</div>
                      <h3>{job.title[locale]}</h3>
                      <p>{salaryLabel(job)}</p>
                      <div className="employer-job-meta"><span><MapPinIcon size={16} />{job.location}, {job.state}</span><span>{jobReference(job)}</span><span>{t.posted} {postedLabel(job.createdAt)}</span>{job.expiresAt && <span>{t.expires} {postedLabel(job.expiresAt)}</span>}</div>
                      {job.moderationReason && <p className="job-moderation-reason">{job.moderationReason}</p>}
                    </div>
                    <div className="job-performance"><span><EyeIcon size={17} />{job.views} {t.views}</span><span><WhatsappLogoIcon size={17} />{job.clicks} {t.clicks}</span></div>
                  </div>
                  <div className="employer-job-actions">
                    <a href={`/jobs/${jobReference(job)}`} target="_blank" rel="noreferrer"><ArrowSquareOutIcon size={17} />{t.preview}</a>
                    {job.status !== "suspended" && job.status !== "expired" && <button type="button" onClick={() => setModal({ type: "edit", job })}><NotePencilIcon size={17} />{t.edit}</button>}
                    {(job.status === "active" || job.status === "paused") && <button type="button" onClick={() => toggleJob(job)}><PauseCircleIcon size={17} />{job.status === "paused" ? t.resume : t.pause}</button>}
                    <button type="button" onClick={() => runJobRpc("employer_copy_job", job)}><CopyIcon size={17} />{t.copy}</button>
                    {(job.status === "active" || job.status === "paused") && <button type="button" onClick={() => closeJob(job)}>{t.close}</button>}
                    {(job.status === "closed" || job.status === "expired") && <button type="button" onClick={() => runJobRpc("employer_repost_job", job)}><ArrowClockwiseIcon size={17} />{t.repost}</button>}
                    {job.status !== "suspended" && <button type="button" onClick={() => runJobRpc("employer_extend_job", job)}>{t.extend}</button>}
                    {!job.boosted && job.status === "active" && <button className="boost-action" type="button" onClick={() => setModal({ type: "boost", job })}><RocketLaunchIcon size={17} />{t.boost}</button>}
                    <button className="delete-action" type="button" onClick={() => setModal({ type: "delete", job })}><TrashIcon size={17} />{t.delete}</button>
                  </div>
                </article>
              )) : <div className="dashboard-empty">{t.empty}</div>}
            </div>
          </section>

        </div>
      </main>

      {modal && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null); }}>
          <section className="dashboard-modal" role="dialog" aria-modal="true" aria-labelledby="dashboard-modal-title">
            <button className="modal-close" type="button" aria-label="Close" onClick={() => setModal(null)}><XIcon size={20} /></button>
            {modal.type === "edit" && (
              <><h2 id="dashboard-modal-title">{t.editTitle}</h2><p>{jobReference(modal.job)}</p><form onSubmit={(event) => saveEdit(event, modal.job)}><label><span>{t.jobTitle}</span><input name="title" defaultValue={modal.job.title[locale]} required /></label><label><span>{t.salaryMin}</span><input name="salaryMin" type="number" min="1" defaultValue={modal.job.salaryMin} required /></label><label><span>{t.salaryMax}</span><input name="salaryMax" type="number" min="1" defaultValue={modal.job.salaryMax} required /></label><div className="modal-actions"><button type="button" onClick={() => setModal(null)}>{t.cancel}</button><button className="primary" type="submit">{t.save}</button></div></form></>
            )}
            {modal.type === "delete" && (
              <><h2 id="dashboard-modal-title">{t.deleteTitle}</h2><p>{t.deleteBody}</p><div className="modal-actions"><button type="button" onClick={() => setModal(null)}>{t.cancel}</button><button className="danger" type="button" onClick={() => deleteJob(modal.job.id)}>{t.confirmDelete}</button></div></>
            )}
            {modal.type === "boost" && (
              <><h2 id="dashboard-modal-title">{t.boostTitle}</h2><p>{t.boostBody}</p><div className="modal-actions"><button type="button" onClick={() => setModal(null)}>{t.cancel}</button><button className="primary" type="button" onClick={() => setModal(null)}>{t.confirmBoost}</button></div></>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
