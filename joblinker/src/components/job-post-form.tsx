"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ClipboardTextIcon,
  CurrencyCircleDollarIcon,
  FloppyDiskIcon,
  MapPinIcon,
  PaperPlaneTiltIcon,
  UsersThreeIcon,
  WhatsappLogoIcon,
} from "@phosphor-icons/react";
import type { Locale } from "@/data/jobs";
import { createClient } from "@/lib/supabase/client";

type FormState = {
  title: string;
  category: string;
  location: string;
  state: string;
  salaryMin: string;
  salaryMax: string;
  salaryUnit: "month" | "day" | "hour";
  workType: "full-time" | "part-time" | "contract";
  description: string;
  requirements: string;
  whatsapp: string;
  vacancies: string;
  urgent: boolean;
};

const emptyForm: FormState = {
  title: "",
  category: "factory",
  location: "",
  state: "Selangor",
  salaryMin: "",
  salaryMax: "",
  salaryUnit: "month",
  workType: "full-time",
  description: "",
  requirements: "",
  whatsapp: "",
  vacancies: "1",
  urgent: false,
};

const copy = {
  en: {
    back: "Back to dashboard",
    title: "Post a new job",
    intro: "Add clear information so workers can decide quickly and contact you on WhatsApp.",
    step: "Step",
    of: "of",
    basics: "Job basics",
    details: "Description",
    contact: "Contact & preview",
    jobTitle: "Job title",
    category: "Job category",
    location: "City or area",
    state: "State",
    salaryMin: "Minimum salary",
    salaryMax: "Maximum salary",
    salaryUnit: "Salary period",
    workType: "Employment type",
    month: "Per month",
    day: "Per day",
    hour: "Per hour",
    fullTime: "Full-time",
    partTime: "Part-time",
    contract: "Contract",
    jobDescription: "Job description",
    jobRequirements: "Requirements",
    descriptionHelp: "Keep it short. Explain the shift, duties, and working environment.",
    requirementsHelp: "List one requirement per line.",
    whatsapp: "WhatsApp number",
    whatsappHelp: "Use Malaysia format, for example 6012 345 6789.",
    vacancies: "Number of vacancies",
    urgent: "Mark as urgent hiring",
    next: "Continue",
    previous: "Back",
    saveDraft: "Save draft",
    draftSaved: "Draft saved on this device.",
    preview: "Job preview",
    verified: "Verified employer",
    verificationPending: "Verification pending",
    submit: "Submit for approval",
    submitting: "Submitting…",
    submitError: "The job could not be submitted. Please try again.",
    reviewNote: "JobLinker will review this listing before it appears publicly.",
    required: "Complete all required fields before continuing.",
    salaryError: "Maximum salary must be higher than minimum salary.",
    phoneError: "Enter a valid Malaysian WhatsApp number.",
    successTitle: "Job submitted for review",
    successBody: "Your job is pending approval. You can monitor its status from the dashboard.",
    returnDashboard: "Return to dashboard",
    another: "Post another job",
  },
  ms: {
    back: "Kembali ke dashboard",
    title: "Iklankan kerja baharu",
    intro: "Berikan maklumat jelas supaya pekerja boleh membuat keputusan dan menghubungi anda melalui WhatsApp.",
    step: "Langkah",
    of: "daripada",
    basics: "Maklumat kerja",
    details: "Penerangan",
    contact: "Hubungan & pratonton",
    jobTitle: "Jawatan",
    category: "Kategori kerja",
    location: "Bandar atau kawasan",
    state: "Negeri",
    salaryMin: "Gaji minimum",
    salaryMax: "Gaji maksimum",
    salaryUnit: "Tempoh gaji",
    workType: "Jenis pekerjaan",
    month: "Sebulan",
    day: "Sehari",
    hour: "Sejam",
    fullTime: "Sepenuh masa",
    partTime: "Separuh masa",
    contract: "Kontrak",
    jobDescription: "Penerangan kerja",
    jobRequirements: "Syarat",
    descriptionHelp: "Pastikan ringkas. Terangkan syif, tugas dan persekitaran kerja.",
    requirementsHelp: "Senaraikan satu syarat bagi setiap baris.",
    whatsapp: "Nombor WhatsApp",
    whatsappHelp: "Gunakan format Malaysia, contohnya 6012 345 6789.",
    vacancies: "Bilangan kekosongan",
    urgent: "Tandakan sebagai pengambilan segera",
    next: "Teruskan",
    previous: "Kembali",
    saveDraft: "Simpan draf",
    draftSaved: "Draf disimpan pada peranti ini.",
    preview: "Pratonton kerja",
    verified: "Majikan disahkan",
    verificationPending: "Pengesahan belum selesai",
    submit: "Hantar untuk kelulusan",
    submitting: "Menghantar…",
    submitError: "Iklan kerja tidak dapat dihantar. Sila cuba lagi.",
    reviewNote: "JobLinker akan menyemak iklan ini sebelum diterbitkan.",
    required: "Lengkapkan semua ruangan wajib sebelum meneruskan.",
    salaryError: "Gaji maksimum mestilah lebih tinggi daripada gaji minimum.",
    phoneError: "Masukkan nombor WhatsApp Malaysia yang sah.",
    successTitle: "Kerja dihantar untuk semakan",
    successBody: "Kerja anda sedang menunggu kelulusan. Pantau statusnya melalui dashboard.",
    returnDashboard: "Kembali ke dashboard",
    another: "Iklankan kerja lain",
  },
} as const;

const categories = [
  { value: "factory", en: "Factory", ms: "Kilang" },
  { value: "warehouse", en: "Warehouse", ms: "Gudang" },
  { value: "retail", en: "Retail", ms: "Runcit" },
  { value: "driver", en: "Driver", ms: "Pemandu" },
  { value: "food-service", en: "Food & Beverage", ms: "Makanan & minuman" },
];

const states = ["Selangor", "Kuala Lumpur", "Johor", "Penang", "Negeri Sembilan", "Perak", "Melaka"];

export function JobPostForm({ initialLocale, userId, companyId, companyName, companyLogoUrl, companyVerified }: { initialLocale: Locale; userId: string; companyId: string; companyName: string; companyLogoUrl: string | null; companyVerified: boolean }) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(() => {
    if (typeof window === "undefined") return emptyForm;
    try {
      const draft = window.localStorage.getItem("joblinker-job-draft");
      if (!draft) return emptyForm;
      const savedDraft = JSON.parse(draft);
      return {
        ...emptyForm,
        ...savedDraft,
        title: savedDraft.title ?? savedDraft.titleEn ?? savedDraft.titleMs ?? "",
        description: savedDraft.description ?? savedDraft.descriptionEn ?? savedDraft.descriptionMs ?? "",
        requirements: savedDraft.requirements ?? savedDraft.requirementsEn ?? savedDraft.requirementsMs ?? "",
      };
    } catch {
      return emptyForm;
    }
  });
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const t = copy[locale];

  const progress = `${Math.round((step / 3) * 100)}%`;

  const previewTitle = form.title;
  const salaryPeriod = t[form.salaryUnit];
  const categoryLabel = categories.find((item) => item.value === form.category)?.[locale] ?? "";
  const previewLocation = [form.location, form.state].filter(Boolean).join(", ");

  const requirements = useMemo(() => {
    return form.requirements.split("\n").map((line) => line.trim()).filter(Boolean).slice(0, 4);
  }, [form.requirements]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
    setSaved(false);
  }

  function validateCurrentStep() {
    if (step === 1) {
      const required = [form.title, form.location, form.salaryMin, form.salaryMax].every((value) => value.trim());
      if (!required) return t.required;
      if (Number(form.salaryMax) <= Number(form.salaryMin)) return t.salaryError;
    }
    if (step === 2) {
      const required = [form.description, form.requirements].every((value) => value.trim());
      if (!required) return t.required;
    }
    if (step === 3) {
      const phone = form.whatsapp.replace(/\D/g, "");
      if (!/^60\d{9,10}$/.test(phone)) return t.phoneError;
      if (!form.vacancies || Number(form.vacancies) < 1) return t.required;
    }
    return "";
  }

  function nextStep() {
    const validation = validateCurrentStep();
    if (validation) {
      setError(validation);
      return;
    }
    setStep((current) => Math.min(3, current + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function saveDraft() {
    try {
      window.localStorage.setItem("joblinker-job-draft", JSON.stringify(form));
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }

  async function submitJob() {
    const validation = validateCurrentStep();
    if (validation) {
      setError(validation);
      return;
    }
    setSubmitting(true);
    setError("");
    const { error: submitError } = await createClient().from("jobs").insert({
      company_id: companyId,
      created_by: userId,
      title_en: form.title.trim(),
      title_ms: form.title.trim(),
      category: form.category,
      location: form.location.trim(),
      state: form.state,
      salary_min: Number(form.salaryMin),
      salary_max: Number(form.salaryMax),
      salary_unit: form.salaryUnit,
      work_type: form.workType,
      description_en: form.description.trim(),
      description_ms: form.description.trim(),
      requirements_en: form.requirements.trim(),
      requirements_ms: form.requirements.trim(),
      whatsapp: form.whatsapp.replace(/\D/g, ""),
      vacancies: Number(form.vacancies),
      urgent: form.urgent,
      updated_at: new Date().toISOString(),
    });

    setSubmitting(false);
    if (submitError) {
      setError(t.submitError);
      return;
    }

    window.localStorage.removeItem("joblinker-job-draft");
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function restart() {
    setForm(emptyForm);
    setStep(1);
    setSubmitted(false);
    setError("");
  }

  if (submitted) {
    return (
      <main className="job-success-page">
        <section>
          <Link className="wordmark" href="/">Job<span>Linker</span></Link>
          <CheckCircleIcon size={44} weight="fill" />
          <h1>{t.successTitle}</h1>
          <p>{t.successBody}</p>
          <div><Link href={`/employer/dashboard?lang=${locale}`}>{t.returnDashboard}</Link><button type="button" onClick={restart}>{t.another}</button></div>
        </section>
      </main>
    );
  }

  return (
    <main className="job-form-page">
      <header className="job-form-header">
        <div><Link className="wordmark" href="/">Job<span>Linker</span></Link><div className="job-form-language" aria-label="Language selector"><button type="button" aria-pressed={locale === "en"} onClick={() => setLocale("en")}>EN</button><span>|</span><button type="button" aria-pressed={locale === "ms"} onClick={() => setLocale("ms")}>BM</button></div></div>
      </header>

      <div className="job-form-shell">
        <Link className="back-link" href={`/employer/dashboard?lang=${locale}`}><ArrowLeftIcon size={17} />{t.back}</Link>
        <section className="job-form-intro">
          <div><p><BriefcaseIcon size={16} weight="fill" />{t.step} {step} {t.of} 3</p><h1>{t.title}</h1><span>{t.intro}</span></div>
          <button type="button" onClick={saveDraft}><FloppyDiskIcon size={18} />{t.saveDraft}</button>
        </section>
        <div className="job-progress" aria-label={`${t.step} ${step} ${t.of} 3`}><span style={{ width: progress }} /></div>
        {saved && <p className="draft-message" role="status"><CheckCircleIcon size={16} weight="fill" />{t.draftSaved}</p>}

        <div className="job-form-layout">
          <section className="job-form-card">
            <div className="step-heading"><span>{step}</span><div><h2>{step === 1 ? t.basics : step === 2 ? t.details : t.contact}</h2><p>{t.step} {step} {t.of} 3</p></div></div>

            {step === 1 && (
              <div className="job-field-grid">
                <label className="full-field"><span>{t.jobTitle}</span><input value={form.title} onChange={(event) => update("title", event.target.value)} required /></label>
                <label><span>{t.category}</span><select value={form.category} onChange={(event) => update("category", event.target.value)}>{categories.map((item) => <option key={item.value} value={item.value}>{item[locale]}</option>)}</select></label>
                <label><span>{t.workType}</span><select value={form.workType} onChange={(event) => update("workType", event.target.value as FormState["workType"])}><option value="full-time">{t.fullTime}</option><option value="part-time">{t.partTime}</option><option value="contract">{t.contract}</option></select></label>
                <label><span>{t.location}</span><input value={form.location} onChange={(event) => update("location", event.target.value)} placeholder="Shah Alam" required /></label>
                <label><span>{t.state}</span><select value={form.state} onChange={(event) => update("state", event.target.value)}>{states.map((item) => <option key={item}>{item}</option>)}</select></label>
                <label><span>{t.salaryMin}</span><div className="money-field"><CurrencyCircleDollarIcon size={18} /><input type="number" min="1" value={form.salaryMin} onChange={(event) => update("salaryMin", event.target.value)} placeholder="1800" required /></div></label>
                <label><span>{t.salaryMax}</span><div className="money-field"><CurrencyCircleDollarIcon size={18} /><input type="number" min="1" value={form.salaryMax} onChange={(event) => update("salaryMax", event.target.value)} placeholder="2400" required /></div></label>
                <label className="full-field"><span>{t.salaryUnit}</span><select value={form.salaryUnit} onChange={(event) => update("salaryUnit", event.target.value as FormState["salaryUnit"])}><option value="month">{t.month}</option><option value="day">{t.day}</option><option value="hour">{t.hour}</option></select></label>
              </div>
            )}

            {step === 2 && (
              <div className="job-field-grid">
                <label className="full-field"><span>{t.jobDescription}</span><textarea rows={6} value={form.description} onChange={(event) => update("description", event.target.value)} required /><small>{t.descriptionHelp}</small></label>
                <label className="full-field"><span>{t.jobRequirements}</span><textarea rows={5} value={form.requirements} onChange={(event) => update("requirements", event.target.value)} required /><small>{t.requirementsHelp}</small></label>
              </div>
            )}

            {step === 3 && (
              <div className="job-field-grid">
                <label className="full-field"><span>{t.whatsapp}</span><div className="phone-field"><WhatsappLogoIcon size={19} /><input type="tel" inputMode="tel" value={form.whatsapp} onChange={(event) => update("whatsapp", event.target.value)} placeholder="6012 345 6789" required /></div><small>{t.whatsappHelp}</small></label>
                <label><span>{t.vacancies}</span><div className="money-field"><UsersThreeIcon size={18} /><input type="number" min="1" value={form.vacancies} onChange={(event) => update("vacancies", event.target.value)} required /></div></label>
                <label className="urgent-check"><input type="checkbox" checked={form.urgent} onChange={(event) => update("urgent", event.target.checked)} /><span>{t.urgent}</span></label>
              </div>
            )}

            {error && <p className="job-form-error" role="alert">{error}</p>}
            <div className="job-form-actions">
              {step > 1 && <button type="button" onClick={() => { setStep((current) => current - 1); setError(""); }}><ArrowLeftIcon size={17} />{t.previous}</button>}
              {step < 3 ? <button className="primary" type="button" onClick={nextStep}>{t.next}<ArrowRightIcon size={17} /></button> : <button className="primary" type="button" onClick={submitJob} disabled={submitting}><PaperPlaneTiltIcon size={17} />{submitting ? t.submitting : t.submit}</button>}
            </div>
          </section>

          <aside className="job-preview-card">
            <p>{t.preview}</p>
            <div className="preview-company"><span>{companyLogoUrl ? <Image src={companyLogoUrl} width={42} height={42} alt="" /> : companyName.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]?.toUpperCase()).join("") || "CO"}</span><div><strong>{companyName}</strong><small><CheckCircleIcon size={14} weight="fill" />{companyVerified ? t.verified : t.verificationPending}</small></div></div>
            {form.urgent && <span className="preview-urgent">Urgent</span>}
            <h2>{previewTitle || t.jobTitle}</h2>
            <p className="preview-salary">{form.salaryMin && form.salaryMax ? `RM${form.salaryMin}–RM${form.salaryMax} · ${salaryPeriod}` : `RM — · ${salaryPeriod}`}</p>
            <div className="preview-meta"><span><MapPinIcon size={16} />{previewLocation || t.location}</span><span><BriefcaseIcon size={16} />{categoryLabel} · {form.workType === "full-time" ? t.fullTime : form.workType === "part-time" ? t.partTime : t.contract}</span><span><UsersThreeIcon size={16} />{form.vacancies} {t.vacancies.toLowerCase()}</span></div>
            {requirements.length > 0 && <ul>{requirements.map((item) => <li key={item}>{item}</li>)}</ul>}
            <div className="preview-whatsapp"><WhatsappLogoIcon size={21} />{form.whatsapp || t.whatsapp}</div>
            <small className="review-note"><ClipboardTextIcon size={15} />{t.reviewNote}</small>
          </aside>
        </div>
      </div>
    </main>
  );
}
