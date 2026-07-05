"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CaretDownIcon,
  CheckCircleIcon,
  CurrencyCircleDollarIcon,
  FadersHorizontalIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  WhatsappLogoIcon,
} from "@phosphor-icons/react";
import type { Job, JobCategory, Locale } from "@/data/jobs";

type SortOrder = "newest" | "salary-high" | "salary-low";

const copy = {
  en: {
    post: "Post a job",
    heading: "Find work near you",
    intro: "Local opportunities, clear information, and one-tap access to employers on WhatsApp.",
    search: "Search jobs or location",
    filters: "Filters",
    state: "State",
    allStates: "All states",
    found: "jobs found",
    sort: "Sort",
    newest: "Newest",
    salaryHigh: "Salary: high to low",
    salaryLow: "Salary: low to high",
    featured: "Featured",
    urgent: "Urgent",
    verified: "Verified employer",
    whatsapp: "WhatsApp employer",
    details: "View job details",
    emptyTitle: "No matching jobs",
    emptyBody: "Try another search, category, or state.",
    clear: "Clear filters",
  },
  ms: {
    post: "Iklankan kerja",
    heading: "Cari kerja berdekatan",
    intro: "Peluang tempatan, maklumat jelas dan terus hubungi majikan melalui WhatsApp.",
    search: "Cari kerja atau lokasi",
    filters: "Penapis",
    state: "Negeri",
    allStates: "Semua negeri",
    found: "jawatan dijumpai",
    sort: "Susun",
    newest: "Terbaharu",
    salaryHigh: "Gaji: tinggi ke rendah",
    salaryLow: "Gaji: rendah ke tinggi",
    featured: "Pilihan",
    urgent: "Segera",
    verified: "Majikan disahkan",
    whatsapp: "WhatsApp majikan",
    details: "Lihat butiran kerja",
    emptyTitle: "Tiada jawatan sepadan",
    emptyBody: "Cuba carian, kategori atau negeri lain.",
    clear: "Kosongkan penapis",
  },
} as const;

const categories: Array<{ id: JobCategory | null; label: Record<Locale, string> }> = [
  { id: null, label: { en: "All jobs", ms: "Semua kerja" } },
  { id: "factory", label: { en: "Factory", ms: "Kilang" } },
  { id: "warehouse", label: { en: "Warehouse", ms: "Gudang" } },
  { id: "retail", label: { en: "Retail", ms: "Runcit" } },
  { id: "driver", label: { en: "Driver", ms: "Pemandu" } },
  { id: "food-service", label: { en: "Food & Beverage", ms: "Makanan & minuman" } },
];

export function JobBoard({ initialJobs }: { initialJobs: Job[] }) {
  const [locale, setLocale] = useState<Locale>("en");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<JobCategory | null>(null);
  const [state, setState] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const t = copy[locale];
  const states = useMemo(() => Array.from(new Set(initialJobs.map((job) => job.location.split(", ").at(-1) ?? ""))).filter(Boolean).sort(), [initialJobs]);

  const visibleJobs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return initialJobs
      .filter((job) => {
        const searchable = `${job.title.en} ${job.title.ms} ${job.company} ${job.location}`.toLowerCase();
        return (!category || job.category === category)
          && (!state || job.location.includes(state))
          && (!normalizedQuery || searchable.includes(normalizedQuery));
      })
      .sort((a, b) => {
        if (sortOrder === "salary-high") return b.salaryMin - a.salaryMin;
        if (sortOrder === "salary-low") return a.salaryMin - b.salaryMin;
        return a.postedHours - b.postedHours;
      });
  }, [category, initialJobs, query, sortOrder, state]);

  function setLanguage(nextLocale: Locale) {
    setLocale(nextLocale);
    document.documentElement.lang = nextLocale;
    window.localStorage.setItem("joblinker-locale", nextLocale);
  }

  function whatsappUrl(job: Job) {
    const reference = job.referenceCode ?? job.id;
    const message = locale === "en"
      ? `Hi, I'm interested in the ${job.title.en} position at ${job.company} (${reference}). Is it still available?`
      : `Hai, saya berminat dengan jawatan ${job.title.ms} di ${job.company} (${reference}). Adakah jawatan ini masih tersedia?`;
    return `https://wa.me/${job.whatsapp}?text=${encodeURIComponent(message)}`;
  }

  function clearFilters() {
    setQuery("");
    setCategory(null);
    setState("");
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="header-inner">
          <a className="wordmark" href="#top" aria-label="JobLinker home">Job<span>Linker</span></a>
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

      <main id="top">
        <section className="intro-section">
          <div className="content-width">
            <h1>{t.heading}</h1>
            <p>{t.intro}</p>
            <div className="search-row">
              <label className="search-box">
                <MagnifyingGlassIcon size={23} aria-hidden="true" />
                <span className="sr-only">{t.search}</span>
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} />
              </label>
              <button className="filter-button" type="button" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((open) => !open)}>
                <FadersHorizontalIcon size={22} />{t.filters}
              </button>
            </div>
            {filtersOpen && (
              <div className="filter-panel">
                <label>
                  <span>{t.state}</span>
                  <select value={state} onChange={(event) => setState(event.target.value)}>
                    <option value="">{t.allStates}</option>
                    {states.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
                <button type="button" onClick={clearFilters}>{t.clear}</button>
              </div>
            )}
          </div>
        </section>

        <nav className="category-nav" aria-label="Job categories">
          <div className="category-scroll content-width">
            {categories.map((item) => {
              const selected = category === item.id;
              return (
                <button key={item.label.en} type="button" aria-pressed={selected} onClick={() => setCategory(item.id)}>
                  {item.label[locale]}
                </button>
              );
            })}
          </div>
        </nav>

        <section className="jobs-section">
          <div className="results-bar content-width">
            <span>{visibleJobs.length} {t.found}</span>
            <label className="sort-control">
              <span>{t.sort}:</span>
              <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as SortOrder)}>
                <option value="newest">{t.newest}</option>
                <option value="salary-high">{t.salaryHigh}</option>
                <option value="salary-low">{t.salaryLow}</option>
              </select>
              <CaretDownIcon size={17} aria-hidden="true" />
            </label>
          </div>

          <div className="jobs-list content-width">
            {visibleJobs.length > 0 ? visibleJobs.map((job) => (
              <article className="job-row" key={job.id}>
                <div className="job-flags">
                  {job.featured && <span>{t.featured}</span>}
                  {job.urgent && <span>{t.urgent}</span>}
                </div>
                <div className={`company-mark${job.companyLogoUrl ? " has-logo" : ""}`}>
                  {job.companyLogoUrl ? <Image src={job.companyLogoUrl} width={76} height={76} alt={`${job.company} logo`} /> : <span aria-hidden="true">{job.initials}</span>}
                </div>
                <div className="job-body">
                  <div className="job-title-line">
                    <h2><Link href={`/jobs/${job.referenceCode ?? job.id}`}>{job.title[locale]}</Link></h2>
                    <time>{job.postedHours}h ago</time>
                  </div>
                  <p className="company-name">{job.company}</p>
                  <div className="job-detail"><MapPinIcon size={17} />{job.location}</div>
                  <div className="job-detail"><CurrencyCircleDollarIcon size={17} />{job.salary[locale]}</div>
                  <div className="job-bottom">
                    {job.verified && <span className="verified"><CheckCircleIcon size={18} weight="fill" />{t.verified}</span>}
                    <div className="job-actions-public">
                      <Link className="job-details-link" href={`/jobs/${job.referenceCode ?? job.id}`}>{t.details}</Link>
                      <a className="whatsapp-link" href={whatsappUrl(job)} target="_blank" rel="noopener noreferrer">
                        <WhatsappLogoIcon size={21} weight="regular" />{t.whatsapp}
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            )) : (
              <div className="empty-state" role="status">
                <h2>{t.emptyTitle}</h2>
                <p>{t.emptyBody}</p>
                <button type="button" onClick={clearFilters}>{t.clear}</button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
