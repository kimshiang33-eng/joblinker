"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeftIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyCircleDollarIcon,
  MapPinIcon,
  ShareNetworkIcon,
  UsersIcon,
  WhatsappLogoIcon,
} from "@phosphor-icons/react";
import type { Job, Locale } from "@/data/jobs";
import { createClient } from "@/lib/supabase/client";

const copy = {
  en: {
    back: "All jobs",
    post: "Post a job",
    featured: "Featured",
    urgent: "Urgent",
    verified: "Verified employer",
    posted: "Posted",
    ago: "hours ago",
    openings: "openings",
    about: "About this job",
    responsibilities: "What you will do",
    requirements: "What we are looking for",
    benefits: "Benefits",
    apply: "Apply via WhatsApp",
    applyHint: "Ask the employer directly. No JobLinker account required.",
    ref: "Job reference",
    share: "Share job",
    shared: "Link copied",
    related: "Similar jobs",
    view: "View details",
  },
  ms: {
    back: "Semua kerja",
    post: "Iklankan kerja",
    featured: "Pilihan",
    urgent: "Segera",
    verified: "Majikan disahkan",
    posted: "Disiarkan",
    ago: "jam lalu",
    openings: "kekosongan",
    about: "Mengenai kerja ini",
    responsibilities: "Tugas anda",
    requirements: "Apa yang kami cari",
    benefits: "Faedah",
    apply: "Mohon melalui WhatsApp",
    applyHint: "Tanya majikan secara terus. Akaun JobLinker tidak diperlukan.",
    ref: "Rujukan kerja",
    share: "Kongsi kerja",
    shared: "Pautan disalin",
    related: "Kerja serupa",
    view: "Lihat butiran",
  },
} as const;

export function JobDetail({ job, relatedJobs }: { job: Job; relatedJobs: Job[] }) {
  const [locale, setLocale] = useState<Locale>("en");
  const [shareStatus, setShareStatus] = useState(false);
  const t = copy[locale];
  const jobReference = job.referenceCode ?? job.id;

  const whatsappUrl = useMemo(() => {
    const message = locale === "en"
      ? `Hi, I'm interested in the ${job.title.en} position at ${job.company} (${jobReference}). Is it still available?`
      : `Hai, saya berminat dengan jawatan ${job.title.ms} di ${job.company} (${jobReference}). Adakah jawatan ini masih tersedia?`;
    return `https://wa.me/${job.whatsapp}?text=${encodeURIComponent(message)}`;
  }, [job, jobReference, locale]);

  useEffect(() => {
    const storageKey = `joblinker-viewed-${jobReference}`;
    if (window.sessionStorage.getItem(storageKey)) return;

    window.sessionStorage.setItem(storageKey, "1");
    void createClient()
      .rpc("record_public_job_event", {
        target_job_reference: jobReference,
        event_type: "view",
      })
      .then(({ error }) => {
        if (error) window.sessionStorage.removeItem(storageKey);
      });
  }, [jobReference]);

  function recordWhatsappClick() {
    void createClient().rpc("record_public_job_event", {
      target_job_reference: jobReference,
      event_type: "whatsapp_click",
    });
  }

  function setLanguage(nextLocale: Locale) {
    setLocale(nextLocale);
    document.documentElement.lang = nextLocale;
    window.localStorage.setItem("joblinker-locale", nextLocale);
  }

  async function shareJob() {
    const shareData = { title: `${job.title[locale]} | JobLinker`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else await navigator.clipboard.writeText(window.location.href);
      setShareStatus(true);
      window.setTimeout(() => setShareStatus(false), 1800);
    } catch {
      // The native share sheet may be dismissed without an error state.
    }
  }

  return (
    <div className="job-detail-page">
      <header className="site-header">
        <div className="header-inner">
          <Link className="wordmark" href="/">Job<span>Linker</span></Link>
          <div className="header-actions">
            <div className="language-switcher" aria-label="Language selector">
              <button type="button" aria-pressed={locale === "en"} onClick={() => setLanguage("en")}>EN</button>
              <span aria-hidden="true">|</span>
              <button type="button" aria-pressed={locale === "ms"} onClick={() => setLanguage("ms")}>BM</button>
            </div>
            <Link className="post-job" href="/employer/login">{t.post}</Link>
          </div>
        </div>
      </header>

      <main className="job-detail-main content-width">
        <div className="job-detail-toolbar">
          <Link href="/"><ArrowLeftIcon size={17} />{t.back}</Link>
          <button type="button" onClick={shareJob} aria-live="polite">
            <ShareNetworkIcon size={17} />{shareStatus ? t.shared : t.share}
          </button>
        </div>

        <div className="job-detail-layout">
          <div className="job-detail-content">
            <section className="job-detail-hero">
              <div className="job-detail-flags">
                {job.featured && <span>{t.featured}</span>}
                {job.urgent && <span>{t.urgent}</span>}
              </div>
              <div className="job-detail-company">
                <div className={`company-mark${job.companyLogoUrl ? " has-logo" : ""}`}>
                  {job.companyLogoUrl ? <Image src={job.companyLogoUrl} width={52} height={52} alt={`${job.company} logo`} /> : <span aria-hidden="true">{job.initials}</span>}
                </div>
                <div>
                  <p>{job.company}</p>
                  {job.verified && <span><CheckCircleIcon size={17} weight="fill" />{t.verified}</span>}
                </div>
              </div>
              <h1>{job.title[locale]}</h1>
              <p className="job-detail-salary">{job.salary[locale]}</p>
              <div className="job-detail-facts">
                <span><MapPinIcon size={18} />{job.location}</span>
                <span><BriefcaseIcon size={18} />{job.employmentType[locale]}</span>
                <span><ClockIcon size={18} />{job.schedule[locale]}</span>
                <span><UsersIcon size={18} />{job.vacancies} {t.openings}</span>
              </div>
              <p className="job-detail-posted">{t.posted} {job.postedHours} {t.ago} · {t.ref}: {jobReference}</p>
            </section>

            <section className="job-detail-section">
              <h2>{t.about}</h2>
              <p>{job.description[locale]}</p>
            </section>
            {job.responsibilities[locale].length > 0 && <DetailList title={t.responsibilities} items={job.responsibilities[locale]} />}
            {job.requirements[locale].length > 0 && <DetailList title={t.requirements} items={job.requirements[locale]} />}
            {job.benefits[locale].length > 0 && <DetailList title={t.benefits} items={job.benefits[locale]} />}

            {relatedJobs.length > 0 && (
              <section className="related-jobs">
                <h2>{t.related}</h2>
                <div>
                  {relatedJobs.map((related) => (
                    <article key={related.id}>
                      <div className={`company-mark${related.companyLogoUrl ? " has-logo" : ""}`}>
                        {related.companyLogoUrl ? <Image src={related.companyLogoUrl} width={43} height={43} alt={`${related.company} logo`} /> : <span aria-hidden="true">{related.initials}</span>}
                      </div>
                      <div>
                        <h3><Link href={`/jobs/${related.referenceCode ?? related.id}`}>{related.title[locale]}</Link></h3>
                        <p>{related.company}</p>
                        <span><MapPinIcon size={14} />{related.location}</span>
                        <Link className="related-link" href={`/jobs/${related.referenceCode ?? related.id}`}>{t.view}</Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="job-apply-card">
            <CurrencyCircleDollarIcon size={24} />
            <strong>{job.salary[locale]}</strong>
            <p>{t.applyHint}</p>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={recordWhatsappClick}>
              <WhatsappLogoIcon size={22} weight="fill" />{t.apply}
            </a>
            <small>{t.ref}: {jobReference}</small>
          </aside>
        </div>
      </main>

      <div className="job-mobile-apply">
        <div><span>{job.salary[locale]}</span><small>{job.company}</small></div>
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={recordWhatsappClick}>
          <WhatsappLogoIcon size={21} weight="fill" />{t.apply}
        </a>
      </div>

    </div>
  );
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="job-detail-section">
      <h2>{title}</h2>
      <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
    </section>
  );
}
