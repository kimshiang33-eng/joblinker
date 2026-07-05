"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowSquareOutIcon,
  BriefcaseIcon,
  BuildingsIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  HouseIcon,
  MagnifyingGlassIcon,
  NotePencilIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  SignOutIcon,
  StarIcon,
  TrendUpIcon,
  UsersThreeIcon,
  WhatsappLogoIcon,
  XCircleIcon,
  XIcon,
} from "@phosphor-icons/react";
import type { Locale, LocalizedText } from "@/data/jobs";
import { createClient } from "@/lib/supabase/client";

type ReviewStatus = "pending" | "approved" | "rejected";
type ReviewFilter = "all" | ReviewStatus;
type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";
type EmployerFilter = "all" | VerificationStatus;

export type AdminJob = {
  id: string;
  referenceCode?: string;
  title: LocalizedText;
  company: string;
  salary: string;
  location: string;
  category: string;
  description: LocalizedText;
  whatsapp: string;
  submitted: string;
  status: ReviewStatus;
  views: number;
  clicks: number;
  featured?: boolean;
  rejectReason?: string;
  moderationStatus?: "active" | "suspended";
  moderationReason?: string;
  expiresAt?: string | null;
};

export type AdminEmployer = {
  id: string;
  name: string;
  registrationNumber: string | null;
  industry: string | null;
  companySize: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  verificationStatus: VerificationStatus;
  createdAt: string;
  jobCount: number;
  approvedJobCount: number;
  accountStatus?: "active" | "suspended";
  suspensionReason?: string | null;
};

export type AdminAuditLog = {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  detail: Record<string, unknown>;
  createdAt: string;
};

export const adminMockJobs: AdminJob[] = [
  {
    id: "JL-1031",
    title: { en: "Packing Operator", ms: "Operator Pembungkusan" },
    company: "ABC Manufacturing Sdn Bhd",
    salary: "RM1,800–RM2,400 / month",
    location: "Shah Alam, Selangor",
    category: "Factory",
    description: {
      en: "Pack finished products, check labels, and keep the work area clean. Day and night shifts are available.",
      ms: "Bungkus produk siap, periksa label dan pastikan kawasan kerja bersih. Syif siang dan malam tersedia.",
    },
    whatsapp: "60123456789",
    submitted: "29 Jun 2026, 10:24",
    status: "pending",
    views: 0,
    clicks: 0,
  },
  {
    id: "JL-1030",
    title: { en: "Retail Assistant", ms: "Pembantu Kedai" },
    company: "Maju Mart Sdn Bhd",
    salary: "RM1,700–RM2,100 / month",
    location: "Seremban, Negeri Sembilan",
    category: "Retail",
    description: {
      en: "Assist customers, arrange shelves, and maintain store cleanliness.",
      ms: "Bantu pelanggan, susun rak dan pastikan kedai bersih.",
    },
    whatsapp: "60111222333",
    submitted: "29 Jun 2026, 09:10",
    status: "pending",
    views: 0,
    clicks: 0,
  },
  {
    id: "JL-1001",
    title: { en: "Production Operator", ms: "Operator Pengeluaran" },
    company: "ABC Manufacturing Sdn Bhd",
    salary: "RM1,800–RM2,400 / month",
    location: "Shah Alam, Selangor",
    category: "Factory",
    description: {
      en: "Operate production equipment and perform basic quality checks.",
      ms: "Kendalikan mesin pengeluaran dan lakukan pemeriksaan kualiti asas.",
    },
    whatsapp: "60123456789",
    submitted: "26 Jun 2026, 14:35",
    status: "approved",
    featured: true,
    views: 384,
    clicks: 67,
  },
  {
    id: "JL-1014",
    title: { en: "Warehouse Assistant", ms: "Pembantu Gudang" },
    company: "Giant Logistics Sdn Bhd",
    salary: "RM1,500–RM1,900 / month",
    location: "Klang, Selangor",
    category: "Warehouse",
    description: {
      en: "Receive goods, prepare orders, and keep stock records accurate.",
      ms: "Terima barang, sediakan pesanan dan pastikan rekod stok tepat.",
    },
    whatsapp: "60199887766",
    submitted: "27 Jun 2026, 11:05",
    status: "approved",
    views: 226,
    clicks: 39,
  },
  {
    id: "JL-1020",
    title: { en: "Part-time Cashier", ms: "Juruwang Sambilan" },
    company: "QuickSave Trading",
    salary: "RM9–RM11 / hour",
    location: "Petaling Jaya, Selangor",
    category: "Retail",
    description: {
      en: "Handle cash payments and assist at the customer service counter.",
      ms: "Urus pembayaran tunai dan bantu di kaunter khidmat pelanggan.",
    },
    whatsapp: "60167778899",
    submitted: "25 Jun 2026, 16:40",
    status: "rejected",
    rejectReason: "Salary information was unclear.",
    views: 0,
    clicks: 0,
  },
];

const copy = {
  en: {
    admin: "Admin panel",
    overview: "Overview",
    review: "Review queue",
    jobs: "All jobs",
    employers: "Employers",
    logout: "Log out",
    greeting: "Job board operations",
    intro: "Review new listings and monitor hiring activity.",
    pendingJobs: "Pending review",
    activeJobs: "Approved jobs",
    totalEmployers: "Employers",
    totalViews: "Total views",
    needsAction: "Needs action",
    liveListings: "Live listings",
    registered: "Registered",
    acrossJobs: "Across all jobs",
    queueTitle: "Job review queue",
    queueBody: "Check listing quality before publication.",
    search: "Search jobs or company",
    all: "All",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    submitted: "Submitted",
    views: "views",
    clicks: "WhatsApp clicks",
    reviewJob: "Review job",
    approve: "Approve",
    reject: "Reject",
    feature: "Mark featured",
    unfeature: "Remove featured",
    featured: "Featured",
    viewPublic: "Public listing",
    empty: "No jobs match this filter.",
    reviewTitle: "Review job listing",
    employer: "Employer",
    category: "Category",
    salary: "Salary",
    location: "Location",
    contact: "WhatsApp contact",
    description: "Description",
    rejectTitle: "Reject this job?",
    rejectHelp: "Give the employer a clear reason so they can correct the listing.",
    rejectReason: "Reason for rejection",
    reasonPlaceholder: "Example: salary range is missing or misleading",
    cancel: "Cancel",
    confirmReject: "Reject job",
    analyticsTitle: "Top job performance",
    analyticsBody: "Basic views and WhatsApp conversion for approved listings.",
    conversion: "Click rate",
    employersTitle: "Employer management",
    employersBody: "Review company profiles and control verified employer status.",
    employerSearch: "Search employer, industry or location",
    unverified: "Unverified",
    verified: "Verified",
    employerEmpty: "No employers match this filter.",
    viewEmployer: "View company",
    verifyEmployer: "Verify employer",
    rejectEmployer: "Reject employer",
    resetEmployer: "Remove verification",
    employerDetails: "Employer details",
    registrationNumber: "Registration number",
    industry: "Industry",
    companySize: "Company size",
    website: "Website",
    email: "Email",
    phone: "Phone",
    address: "Business address",
    registeredOn: "Registered",
    jobPosts: "job posts",
    approvedPosts: "approved",
    takeDown: "Take down",
    restore: "Restore",
    extend: "Extend 30 days",
    suspended: "Suspended",
    expires: "Expires",
    takedownTitle: "Take down this job?",
    takedownHelp: "Give the employer a clear moderation reason.",
    confirmTakedown: "Take down job",
    suspendAccount: "Suspend account",
    restoreAccount: "Restore account",
    suspensionTitle: "Suspend this employer?",
    suspensionHelp: "The employer can sign in, but cannot post and all public jobs will be hidden.",
    confirmSuspension: "Suspend employer",
    auditTitle: "Recent admin activity",
    auditBody: "Approvals, takedowns, account actions, and expiry extensions.",
  },
  ms: {
    admin: "Panel admin",
    overview: "Ringkasan",
    review: "Barisan semakan",
    jobs: "Semua kerja",
    employers: "Majikan",
    logout: "Log keluar",
    greeting: "Operasi portal kerja",
    intro: "Semak iklan baharu dan pantau aktiviti pengambilan.",
    pendingJobs: "Menunggu semakan",
    activeJobs: "Kerja diluluskan",
    totalEmployers: "Majikan",
    totalViews: "Jumlah tontonan",
    needsAction: "Perlu tindakan",
    liveListings: "Iklan aktif",
    registered: "Berdaftar",
    acrossJobs: "Semua kerja",
    queueTitle: "Barisan semakan kerja",
    queueBody: "Semak kualiti iklan sebelum diterbitkan.",
    search: "Cari kerja atau syarikat",
    all: "Semua",
    pending: "Menunggu",
    approved: "Diluluskan",
    rejected: "Ditolak",
    submitted: "Dihantar",
    views: "tontonan",
    clicks: "klik WhatsApp",
    reviewJob: "Semak kerja",
    approve: "Luluskan",
    reject: "Tolak",
    feature: "Tandakan featured",
    unfeature: "Buang featured",
    featured: "Featured",
    viewPublic: "Iklan awam",
    empty: "Tiada kerja sepadan dengan penapis ini.",
    reviewTitle: "Semak iklan kerja",
    employer: "Majikan",
    category: "Kategori",
    salary: "Gaji",
    location: "Lokasi",
    contact: "Nombor WhatsApp",
    description: "Penerangan",
    rejectTitle: "Tolak kerja ini?",
    rejectHelp: "Berikan sebab yang jelas supaya majikan boleh membetulkan iklan.",
    rejectReason: "Sebab penolakan",
    reasonPlaceholder: "Contoh: julat gaji tiada atau mengelirukan",
    cancel: "Batal",
    confirmReject: "Tolak kerja",
    analyticsTitle: "Prestasi kerja terbaik",
    analyticsBody: "Tontonan dan penukaran WhatsApp untuk iklan yang diluluskan.",
    conversion: "Kadar klik",
    employersTitle: "Pengurusan majikan",
    employersBody: "Semak profil syarikat dan kawal status majikan disahkan.",
    employerSearch: "Cari majikan, industri atau lokasi",
    unverified: "Belum disahkan",
    verified: "Disahkan",
    employerEmpty: "Tiada majikan sepadan dengan penapis ini.",
    viewEmployer: "Lihat syarikat",
    verifyEmployer: "Sahkan majikan",
    rejectEmployer: "Tolak majikan",
    resetEmployer: "Buang pengesahan",
    employerDetails: "Butiran majikan",
    registrationNumber: "Nombor pendaftaran",
    industry: "Industri",
    companySize: "Saiz syarikat",
    website: "Laman web",
    email: "E-mel",
    phone: "Telefon",
    address: "Alamat perniagaan",
    registeredOn: "Berdaftar",
    jobPosts: "iklan kerja",
    approvedPosts: "diluluskan",
    takeDown: "Turunkan",
    restore: "Pulihkan",
    extend: "Lanjut 30 hari",
    suspended: "Digantung",
    expires: "Tamat",
    takedownTitle: "Turunkan iklan ini?",
    takedownHelp: "Berikan sebab moderasi yang jelas kepada majikan.",
    confirmTakedown: "Turunkan iklan",
    suspendAccount: "Gantung akaun",
    restoreAccount: "Pulihkan akaun",
    suspensionTitle: "Gantung majikan ini?",
    suspensionHelp: "Majikan masih boleh log masuk, tetapi tidak boleh mengiklan dan semua kerja awam akan disembunyikan.",
    confirmSuspension: "Gantung majikan",
    auditTitle: "Aktiviti admin terkini",
    auditBody: "Kelulusan, penurunan, tindakan akaun dan lanjutan tempoh.",
  },
} as const;

type ModalState = { type: "review" | "reject" | "takedown"; jobId: string } | { type: "employer" | "suspendEmployer"; employerId: string } | null;

type AdminPanelProps = {
  initialJobs: AdminJob[];
  initialEmployers: AdminEmployer[];
  initialAuditLogs: AdminAuditLog[];
  adminEmail: string;
  initialLoadError?: string | null;
};

export function AdminPanel({ initialJobs, initialEmployers, initialAuditLogs, adminEmail, initialLoadError = null }: AdminPanelProps) {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>("en");
  const [jobs, setJobs] = useState(initialJobs);
  const [employers, setEmployers] = useState(initialEmployers);
  const auditLogs = initialAuditLogs;
  const [filter, setFilter] = useState<ReviewFilter>("pending");
  const [query, setQuery] = useState("");
  const [employerQuery, setEmployerQuery] = useState("");
  const [employerFilter, setEmployerFilter] = useState<EmployerFilter>("all");
  const [modal, setModal] = useState<ModalState>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [busyJobId, setBusyJobId] = useState<string | null>(null);
  const [busyEmployerId, setBusyEmployerId] = useState<string | null>(null);
  const [actionError, setActionError] = useState(initialLoadError);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const t = copy[locale];

  const metrics = useMemo(() => {
    const pending = jobs.filter((job) => job.status === "pending").length;
    const approved = jobs.filter((job) => job.status === "approved").length;
    const views = jobs.reduce((sum, job) => sum + job.views, 0);
    return { pending, approved, views, employers: employers.length };
  }, [employers.length, jobs]);

  const visibleJobs = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesFilter = filter === "all" || job.status === filter;
      const haystack = `${job.referenceCode ?? job.id} ${job.title.en} ${job.title.ms} ${job.company} ${job.location}`.toLowerCase();
      return matchesFilter && (!needle || haystack.includes(needle));
    });
  }, [filter, jobs, query]);

  const visibleEmployers = useMemo(() => {
    const needle = employerQuery.trim().toLowerCase();
    return employers.filter((employer) => {
      const matchesFilter = employerFilter === "all" || employer.verificationStatus === employerFilter;
      const haystack = `${employer.name} ${employer.registrationNumber ?? ""} ${employer.industry ?? ""} ${employer.city ?? ""} ${employer.state ?? ""}`.toLowerCase();
      return matchesFilter && (!needle || haystack.includes(needle));
    });
  }, [employerFilter, employerQuery, employers]);

  const topJobs = useMemo(() => jobs.filter((job) => job.status === "approved").sort((a, b) => b.views - a.views), [jobs]);
  const selectedJob = modal && "jobId" in modal ? jobs.find((job) => job.id === modal.jobId) : undefined;
  const selectedEmployer = modal && "employerId" in modal ? employers.find((employer) => employer.id === modal.employerId) : undefined;

  const registeredLabel = (createdAt: string) => new Intl.DateTimeFormat(locale === "ms" ? "ms-MY" : "en-MY", { dateStyle: "medium" }).format(new Date(createdAt));

  function setLanguage(nextLocale: Locale) {
    setLocale(nextLocale);
    document.documentElement.lang = nextLocale;
  }

  async function approveJob(jobId: string) {
    setBusyJobId(jobId);
    setActionError(null);
    const { error } = await createClient().rpc("admin_review_job", {
      target_job_id: jobId,
      new_status: "approved",
      feedback: null,
    });
    setBusyJobId(null);
    if (error) {
      setActionError(error.message);
      return;
    }
    setJobs((current) => current.map((job) => job.id === jobId ? { ...job, status: "approved", rejectReason: undefined } : job));
    setModal(null);
    router.refresh();
  }

  async function submitRejection(jobId: string) {
    if (!rejectReason.trim()) return;
    setBusyJobId(jobId);
    setActionError(null);
    const feedback = rejectReason.trim();
    const { error } = await createClient().rpc("admin_review_job", {
      target_job_id: jobId,
      new_status: "rejected",
      feedback,
    });
    setBusyJobId(null);
    if (error) {
      setActionError(error.message);
      return;
    }
    setJobs((current) => current.map((job) => job.id === jobId ? { ...job, status: "rejected", rejectReason: feedback, featured: false } : job));
    setRejectReason("");
    setModal(null);
    router.refresh();
  }

  async function toggleFeatured(jobId: string) {
    const job = jobs.find((item) => item.id === jobId);
    if (!job) return;
    const makeFeatured = !job.featured;
    setBusyJobId(jobId);
    setActionError(null);
    const { error } = await createClient().rpc("admin_set_job_featured", {
      target_job_id: jobId,
      make_featured: makeFeatured,
    });
    setBusyJobId(null);
    if (error) {
      setActionError(error.message);
      return;
    }
    setJobs((current) => current.map((item) => item.id === jobId ? { ...item, featured: makeFeatured } : item));
    router.refresh();
  }

  async function setEmployerVerification(employerId: string, verificationStatus: VerificationStatus) {
    setBusyEmployerId(employerId);
    setActionError(null);
    const { error } = await createClient().rpc("admin_set_company_verification", {
      target_company_id: employerId,
      new_status: verificationStatus,
    });
    setBusyEmployerId(null);
    if (error) {
      setActionError(error.message);
      return;
    }
    setEmployers((current) => current.map((employer) => employer.id === employerId ? { ...employer, verificationStatus } : employer));
    router.refresh();
  }

  async function setJobModeration(jobId: string, moderationStatus: "active" | "suspended") {
    const reason = moderationStatus === "suspended" ? rejectReason.trim() : null;
    if (moderationStatus === "suspended" && !reason) return;
    setBusyJobId(jobId);
    setActionError(null);
    const { error } = await createClient().rpc("admin_set_job_moderation", {
      target_job_id: jobId,
      new_status: moderationStatus,
      reason,
    });
    setBusyJobId(null);
    if (error) { setActionError(error.message); return; }
    setJobs((current) => current.map((job) => job.id === jobId ? { ...job, moderationStatus, moderationReason: reason ?? undefined, featured: moderationStatus === "suspended" ? false : job.featured } : job));
    setRejectReason("");
    setModal(null);
    router.refresh();
  }

  async function extendJob(jobId: string) {
    setBusyJobId(jobId);
    setActionError(null);
    const { error } = await createClient().rpc("admin_extend_job", { target_job_id: jobId, extension_days: 30 });
    setBusyJobId(null);
    if (error) { setActionError(error.message); return; }
    setJobs((current) => current.map((job) => job.id === jobId ? { ...job, expiresAt: new Date(Math.max(job.expiresAt ? new Date(job.expiresAt).getTime() : 0, Date.now()) + 30 * 86400000).toISOString() } : job));
    router.refresh();
  }

  async function setEmployerAccountStatus(employerId: string, accountStatus: "active" | "suspended") {
    const reason = accountStatus === "suspended" ? rejectReason.trim() : null;
    if (accountStatus === "suspended" && !reason) return;
    setBusyEmployerId(employerId);
    setActionError(null);
    const { error } = await createClient().rpc("admin_set_company_account_status", { target_company_id: employerId, new_status: accountStatus, reason });
    setBusyEmployerId(null);
    if (error) { setActionError(error.message); return; }
    setEmployers((current) => current.map((employer) => employer.id === employerId ? { ...employer, accountStatus, suspensionReason: reason } : employer));
    setRejectReason("");
    setModal(null);
    router.refresh();
  }

  async function logout() {
    setIsLoggingOut(true);
    setActionError(null);
    const { error } = await createClient().auth.signOut();
    if (error) {
      setActionError(error.message);
      setIsLoggingOut(false);
      return;
    }
    router.replace("/admin/login");
    router.refresh();
  }

  function openReject(jobId: string) {
    setRejectReason("");
    setModal({ type: "reject", jobId });
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="wordmark" href="/">Job<span>Linker</span></Link>
        <p>{t.admin}</p>
        <nav aria-label="Admin navigation">
          <a className="active" href="#overview"><HouseIcon size={19} weight="fill" />{t.overview}</a>
          <a href="#review"><ShieldCheckIcon size={19} />{t.review}<span>{metrics.pending}</span></a>
          <a href="#review"><BriefcaseIcon size={19} />{t.jobs}</a>
          <a href="#employers"><BuildingsIcon size={19} />{t.employers}</a>
          <a href="#audit"><NotePencilIcon size={19} />{t.auditTitle}</a>
        </nav>
        <button className="admin-logout" type="button" disabled={isLoggingOut} onClick={logout}><SignOutIcon size={18} />{t.logout}</button>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <Link className="admin-mobile-logo wordmark" href="/">Job<span>Linker</span></Link>
          <div className="admin-user"><span>AD</span><div><strong>{adminEmail}</strong><small>Operations</small></div></div>
          <div className="admin-language" aria-label="Language selector"><button type="button" aria-pressed={locale === "en"} onClick={() => setLanguage("en")}>EN</button><span>|</span><button type="button" aria-pressed={locale === "ms"} onClick={() => setLanguage("ms")}>BM</button></div>
        </header>

        <div className="admin-content">
          <section className="admin-intro" id="overview"><p>{t.admin}</p><h1>{t.greeting}</h1><span>{t.intro}</span></section>

          <section className="admin-metrics" aria-label={t.overview}>
            <article><div><ClockIcon size={20} /></div><p>{t.pendingJobs}</p><strong>{metrics.pending}</strong><span>{t.needsAction}</span></article>
            <article><div><CheckCircleIcon size={20} /></div><p>{t.activeJobs}</p><strong>{metrics.approved}</strong><span>{t.liveListings}</span></article>
            <article><div><UsersThreeIcon size={20} /></div><p>{t.totalEmployers}</p><strong>{metrics.employers}</strong><span>{t.registered}</span></article>
            <article><div><EyeIcon size={20} /></div><p>{t.totalViews}</p><strong>{metrics.views}</strong><span>{t.acrossJobs}</span></article>
          </section>

          <section className="admin-review" id="review">
            <div className="admin-section-heading"><div><h2>{t.queueTitle}</h2><p>{t.queueBody}</p></div><span>{visibleJobs.length}</span></div>
            {actionError && <div className="admin-action-error" role="alert">{actionError}</div>}
            <div className="admin-toolbar">
              <label><MagnifyingGlassIcon size={19} /><span className="sr-only">{t.search}</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} /></label>
              <div aria-label="Review status filter">{(["pending", "all", "approved", "rejected"] as ReviewFilter[]).map((item) => <button type="button" key={item} aria-pressed={filter === item} onClick={() => setFilter(item)}>{t[item]}</button>)}</div>
            </div>

            <div className="admin-job-list">
              {visibleJobs.length ? visibleJobs.map((job) => (
                <article className="admin-job" key={job.id}>
                  <div className="admin-job-main">
                    <div className="admin-job-title">
                      <div><span className={`admin-state ${job.status}`}>{t[job.status]}</span>{job.moderationStatus === "suspended" && <span className="admin-state rejected">{t.suspended}</span>}{job.featured && <span className="admin-featured"><StarIcon size={13} weight="fill" />{t.featured}</span>}</div>
                      <h3>{job.title[locale]}</h3>
                      <p>{job.company}</p>
                      <div className="admin-job-meta"><span>{job.referenceCode ?? job.id}</span><span>{job.category}</span><span>{job.location}</span><span>{t.submitted} {job.submitted}</span>{job.expiresAt && <span>{t.expires} {registeredLabel(job.expiresAt)}</span>}</div>
                    </div>
                    <div className="admin-job-performance"><span><EyeIcon size={16} />{job.views} {t.views}</span><span><WhatsappLogoIcon size={16} />{job.clicks} {t.clicks}</span></div>
                  </div>
                  <div className="admin-job-actions">
                    <button type="button" disabled={busyJobId === job.id} onClick={() => setModal({ type: "review", jobId: job.id })}><NotePencilIcon size={17} />{t.reviewJob}</button>
                    {job.status === "pending" && <><button className="approve" type="button" disabled={busyJobId === job.id} onClick={() => approveJob(job.id)}><CheckCircleIcon size={17} />{t.approve}</button><button className="reject" type="button" disabled={busyJobId === job.id} onClick={() => openReject(job.id)}><XCircleIcon size={17} />{t.reject}</button></>}
                    {job.status === "approved" && <button className="feature" type="button" disabled={busyJobId === job.id} onClick={() => toggleFeatured(job.id)}><RocketLaunchIcon size={17} />{job.featured ? t.unfeature : t.feature}</button>}
                    {job.status === "approved" && <button type="button" disabled={busyJobId === job.id} onClick={() => extendJob(job.id)}><ClockIcon size={17} />{t.extend}</button>}
                    {job.status === "approved" && (job.moderationStatus === "suspended" ? <button className="approve" type="button" disabled={busyJobId === job.id} onClick={() => setJobModeration(job.id, "active")}><CheckCircleIcon size={17} />{t.restore}</button> : <button className="reject" type="button" disabled={busyJobId === job.id} onClick={() => { setRejectReason(""); setModal({ type: "takedown", jobId: job.id }); }}><XCircleIcon size={17} />{t.takeDown}</button>)}
                    {job.status === "approved" && job.moderationStatus !== "suspended" && <a href={`/jobs/${job.referenceCode ?? job.id}`} target="_blank" rel="noreferrer"><ArrowSquareOutIcon size={17} />{t.viewPublic}</a>}
                  </div>
                </article>
              )) : <div className="admin-empty">{t.empty}</div>}
            </div>
          </section>

          <section className="admin-employers" id="employers">
            <div className="admin-section-heading"><div><h2>{t.employersTitle}</h2><p>{t.employersBody}</p></div><span>{visibleEmployers.length}</span></div>
            <div className="admin-toolbar">
              <label><MagnifyingGlassIcon size={19} /><span className="sr-only">{t.employerSearch}</span><input value={employerQuery} onChange={(event) => setEmployerQuery(event.target.value)} placeholder={t.employerSearch} /></label>
              <div aria-label="Employer verification filter">{(["all", "unverified", "pending", "verified", "rejected"] as EmployerFilter[]).map((item) => <button type="button" key={item} aria-pressed={employerFilter === item} onClick={() => setEmployerFilter(item)}>{t[item]}</button>)}</div>
            </div>

            <div className="admin-employer-list">
              {visibleEmployers.length ? visibleEmployers.map((employer) => (
                <article className="admin-employer" key={employer.id}>
                  <div className="admin-employer-main">
                    <div>
                      <span className={`employer-verification-state ${employer.verificationStatus}`}>{employer.verificationStatus === "verified" && <CheckCircleIcon size={13} weight="fill" />}{t[employer.verificationStatus]}</span>{employer.accountStatus === "suspended" && <span className="admin-state rejected">{t.suspended}</span>}
                      <h3>{employer.name}</h3>
                      <p>{employer.industry || "—"}{employer.city || employer.state ? ` · ${[employer.city, employer.state].filter(Boolean).join(", ")}` : ""}</p>
                      <div className="admin-employer-meta"><span>{t.registeredOn} {registeredLabel(employer.createdAt)}</span><span>{employer.jobCount} {t.jobPosts}</span><span>{employer.approvedJobCount} {t.approvedPosts}</span></div>
                    </div>
                  </div>
                  <div className="admin-employer-actions">
                    <button type="button" onClick={() => setModal({ type: "employer", employerId: employer.id })}><BuildingsIcon size={17} />{t.viewEmployer}</button>
                    {employer.verificationStatus !== "verified" && <button className="approve" type="button" disabled={busyEmployerId === employer.id} onClick={() => setEmployerVerification(employer.id, "verified")}><CheckCircleIcon size={17} />{t.verifyEmployer}</button>}
                    {employer.verificationStatus !== "rejected" && <button className="reject" type="button" disabled={busyEmployerId === employer.id} onClick={() => setEmployerVerification(employer.id, "rejected")}><XCircleIcon size={17} />{t.rejectEmployer}</button>}
                    {employer.verificationStatus === "verified" && <button type="button" disabled={busyEmployerId === employer.id} onClick={() => setEmployerVerification(employer.id, "unverified")}>{t.resetEmployer}</button>}
                    {employer.accountStatus === "suspended" ? <button className="approve" type="button" disabled={busyEmployerId === employer.id} onClick={() => setEmployerAccountStatus(employer.id, "active")}><CheckCircleIcon size={17} />{t.restoreAccount}</button> : <button className="reject" type="button" disabled={busyEmployerId === employer.id} onClick={() => { setRejectReason(""); setModal({ type: "suspendEmployer", employerId: employer.id }); }}><XCircleIcon size={17} />{t.suspendAccount}</button>}
                  </div>
                </article>
              )) : <div className="admin-empty">{t.employerEmpty}</div>}
            </div>
          </section>

          <section className="admin-audit" id="audit">
            <div className="admin-section-heading"><div><h2>{t.auditTitle}</h2><p>{t.auditBody}</p></div><span>{auditLogs.length}</span></div>
            <div className="admin-audit-list">
              {auditLogs.length ? auditLogs.map((entry) => <article key={entry.id}><strong>{entry.action.replaceAll("_", " ")}</strong><span>{entry.targetType} · {String(entry.detail.reference ?? entry.detail.company ?? entry.targetId)}</span><time>{new Intl.DateTimeFormat(locale === "ms" ? "ms-MY" : "en-MY", { dateStyle: "medium", timeStyle: "short" }).format(new Date(entry.createdAt))}</time></article>) : <div className="admin-empty">—</div>}
            </div>
          </section>

          <section className="admin-analytics" id="analytics">
            <div className="admin-section-heading"><div><h2>{t.analyticsTitle}</h2><p>{t.analyticsBody}</p></div><TrendUpIcon size={23} /></div>
            <div className="analytics-table" role="table" aria-label={t.analyticsTitle}>
              {topJobs.map((job) => {
                const conversion = job.views ? Math.round((job.clicks / job.views) * 100) : 0;
                return <div role="row" key={job.id}><div role="cell"><strong>{job.title[locale]}</strong><span>{job.company}</span></div><span role="cell">{job.views} {t.views}</span><span role="cell">{job.clicks} {t.clicks}</span><span role="cell">{conversion}% {t.conversion}</span></div>;
              })}
            </div>
          </section>
        </div>
      </main>

      {modal && selectedJob && (
        <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setModal(null); }}>
          <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-modal-title">
            <button className="admin-modal-close" type="button" aria-label="Close" onClick={() => setModal(null)}><XIcon size={20} /></button>
            {modal.type === "review" ? (
              <>
                <div className="admin-modal-title"><span className={`admin-state ${selectedJob.status}`}>{t[selectedJob.status]}</span><h2 id="admin-modal-title">{t.reviewTitle}</h2><p>{selectedJob.referenceCode ?? selectedJob.id}</p></div>
                <div className="admin-review-detail">
                  <div><span>{t.employer}</span><strong>{selectedJob.company}</strong></div>
                  <div><span>{t.category}</span><strong>{selectedJob.category}</strong></div>
                  <div><span>{t.salary}</span><strong>{selectedJob.salary}</strong></div>
                  <div><span>{t.location}</span><strong>{selectedJob.location}</strong></div>
                  <div className="full"><span>{t.contact}</span><strong>{selectedJob.whatsapp}</strong></div>
                  <div className="full"><span>{t.description}</span><p>{selectedJob.description[locale]}</p></div>
                </div>
                <div className="admin-modal-actions">
                  <button type="button" onClick={() => setModal(null)}>{t.cancel}</button>
                  {selectedJob.status === "pending" && <><button className="reject" type="button" disabled={busyJobId === selectedJob.id} onClick={() => openReject(selectedJob.id)}>{t.reject}</button><button className="approve" type="button" disabled={busyJobId === selectedJob.id} onClick={() => approveJob(selectedJob.id)}>{t.approve}</button></>}
                </div>
              </>
            ) : (
              <>
                <h2 id="admin-modal-title">{modal.type === "takedown" ? t.takedownTitle : t.rejectTitle}</h2><p>{modal.type === "takedown" ? t.takedownHelp : t.rejectHelp}</p>
                <label><span>{t.rejectReason}</span><textarea rows={4} value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} placeholder={t.reasonPlaceholder} /></label>
                <div className="admin-modal-actions"><button type="button" onClick={() => setModal(null)}>{t.cancel}</button><button className="reject" type="button" disabled={!rejectReason.trim() || busyJobId === selectedJob.id} onClick={() => modal.type === "takedown" ? setJobModeration(selectedJob.id, "suspended") : submitRejection(selectedJob.id)}>{modal.type === "takedown" ? t.confirmTakedown : t.confirmReject}</button></div>
              </>
            )}
          </section>
        </div>
      )}

      {modal?.type === "employer" && selectedEmployer && (
        <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setModal(null); }}>
          <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-employer-modal-title">
            <button className="admin-modal-close" type="button" aria-label="Close" onClick={() => setModal(null)}><XIcon size={20} /></button>
            <div className="admin-modal-title">
              <span className={`employer-verification-state ${selectedEmployer.verificationStatus}`}>{selectedEmployer.verificationStatus === "verified" && <CheckCircleIcon size={13} weight="fill" />}{t[selectedEmployer.verificationStatus]}</span>
              <h2 id="admin-employer-modal-title">{t.employerDetails}</h2>
              <p>{selectedEmployer.name}</p>
            </div>
            <div className="admin-review-detail">
              <div><span>{t.registrationNumber}</span><strong>{selectedEmployer.registrationNumber || "—"}</strong></div>
              <div><span>{t.industry}</span><strong>{selectedEmployer.industry || "—"}</strong></div>
              <div><span>{t.companySize}</span><strong>{selectedEmployer.companySize || "—"}</strong></div>
              <div><span>{t.registeredOn}</span><strong>{registeredLabel(selectedEmployer.createdAt)}</strong></div>
              <div><span>{t.email}</span><strong>{selectedEmployer.email || "—"}</strong></div>
              <div><span>{t.phone}</span><strong>{selectedEmployer.phone || "—"}</strong></div>
              <div className="full"><span>{t.website}</span><strong>{selectedEmployer.website || "—"}</strong></div>
              <div className="full"><span>{t.address}</span><strong>{[selectedEmployer.address, selectedEmployer.city, selectedEmployer.state].filter(Boolean).join(", ") || "—"}</strong></div>
              <div><span>{t.jobPosts}</span><strong>{selectedEmployer.jobCount}</strong></div>
              <div><span>{t.approvedPosts}</span><strong>{selectedEmployer.approvedJobCount}</strong></div>
            </div>
            <div className="admin-modal-actions">
              <button type="button" onClick={() => setModal(null)}>{t.cancel}</button>
              {selectedEmployer.verificationStatus !== "rejected" && <button className="reject" type="button" disabled={busyEmployerId === selectedEmployer.id} onClick={() => setEmployerVerification(selectedEmployer.id, "rejected")}>{t.rejectEmployer}</button>}
              {selectedEmployer.verificationStatus !== "verified" && <button className="approve" type="button" disabled={busyEmployerId === selectedEmployer.id} onClick={() => setEmployerVerification(selectedEmployer.id, "verified")}>{t.verifyEmployer}</button>}
            </div>
          </section>
        </div>
      )}

      {modal?.type === "suspendEmployer" && selectedEmployer && (
        <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setModal(null); }}>
          <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-employer-suspend-title">
            <button className="admin-modal-close" type="button" aria-label="Close" onClick={() => setModal(null)}><XIcon size={20} /></button>
            <h2 id="admin-employer-suspend-title">{t.suspensionTitle}</h2><p>{t.suspensionHelp}</p>
            <label><span>{t.rejectReason}</span><textarea rows={4} value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} placeholder={t.reasonPlaceholder} /></label>
            <div className="admin-modal-actions"><button type="button" onClick={() => setModal(null)}>{t.cancel}</button><button className="reject" type="button" disabled={!rejectReason.trim() || busyEmployerId === selectedEmployer.id} onClick={() => setEmployerAccountStatus(selectedEmployer.id, "suspended")}>{t.confirmSuspension}</button></div>
          </section>
        </div>
      )}
    </div>
  );
}
