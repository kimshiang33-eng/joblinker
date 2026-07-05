"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  BriefcaseIcon,
  BuildingsIcon,
  ChartBarIcon,
  FloppyDiskIcon,
  GearIcon,
  HouseIcon,
  SignOutIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";
import type { Locale } from "@/data/jobs";
import { createClient } from "@/lib/supabase/client";

export type CompanyProfileRecord = {
  id: string;
  name: string;
  registration_number: string | null;
  industry: string | null;
  company_size: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  description_en: string | null;
  description_ms: string | null;
  logo_path: string | null;
  verification_status: "unverified" | "pending" | "verified" | "rejected";
};

const copy = {
  en: {
    dashboard: "Employer dashboard",
    overview: "Overview",
    jobs: "My jobs",
    analytics: "Analytics",
    profile: "Company profile",
    logout: "Log out",
    back: "Back to dashboard",
    eyebrow: "Company settings",
    title: "Company profile",
    intro: "Keep the information workers see about your company accurate and complete.",
    identity: "Company identity",
    uploadLogo: "Upload logo",
    replaceLogo: "Replace logo",
    uploadingLogo: "Uploading…",
    logoHint: "PNG, JPEG or WebP. Maximum 2MB.",
    logoTypeError: "Choose a PNG, JPEG or WebP image.",
    logoSizeError: "The logo must be smaller than 2MB.",
    logoUploadError: "The logo could not be uploaded. Please try again.",
    logoSaved: "Company logo uploaded.",
    status: "Verification status",
    basic: "Company details",
    basicBody: "Official information used across your job listings.",
    contact: "Contact details",
    contactBody: "How workers and JobLinker can reach your company.",
    location: "Company location",
    locationBody: "Your primary Malaysian business address.",
    about: "About the company",
    aboutBody: "Provide both languages for a complete bilingual listing.",
    name: "Company name",
    registration: "SSM registration number",
    industry: "Industry",
    size: "Company size",
    email: "Company email",
    phone: "WhatsApp / phone",
    website: "Website",
    address: "Address",
    city: "City",
    state: "State",
    descriptionEn: "Company description (English)",
    descriptionMs: "Company description (Bahasa Malaysia)",
    select: "Select",
    save: "Save company profile",
    saving: "Saving…",
    saved: "Company profile saved.",
    required: "Company name is required.",
    failed: "The profile could not be saved. Please try again.",
  },
  ms: {
    dashboard: "Dashboard majikan",
    overview: "Ringkasan",
    jobs: "Kerja saya",
    analytics: "Analitik",
    profile: "Profil syarikat",
    logout: "Log keluar",
    back: "Kembali ke dashboard",
    eyebrow: "Tetapan syarikat",
    title: "Profil syarikat",
    intro: "Pastikan maklumat yang dilihat oleh pekerja tepat dan lengkap.",
    identity: "Identiti syarikat",
    uploadLogo: "Muat naik logo",
    replaceLogo: "Ganti logo",
    uploadingLogo: "Memuat naik…",
    logoHint: "PNG, JPEG atau WebP. Maksimum 2MB.",
    logoTypeError: "Pilih imej PNG, JPEG atau WebP.",
    logoSizeError: "Logo mestilah lebih kecil daripada 2MB.",
    logoUploadError: "Logo tidak dapat dimuat naik. Sila cuba lagi.",
    logoSaved: "Logo syarikat telah dimuat naik.",
    status: "Status pengesahan",
    basic: "Maklumat syarikat",
    basicBody: "Maklumat rasmi yang digunakan pada iklan kerja anda.",
    contact: "Maklumat hubungan",
    contactBody: "Cara pekerja dan JobLinker menghubungi syarikat anda.",
    location: "Lokasi syarikat",
    locationBody: "Alamat utama perniagaan anda di Malaysia.",
    about: "Tentang syarikat",
    aboutBody: "Lengkapkan kedua-dua bahasa untuk iklan dwibahasa.",
    name: "Nama syarikat",
    registration: "Nombor pendaftaran SSM",
    industry: "Industri",
    size: "Saiz syarikat",
    email: "E-mel syarikat",
    phone: "WhatsApp / telefon",
    website: "Laman web",
    address: "Alamat",
    city: "Bandar",
    state: "Negeri",
    descriptionEn: "Penerangan syarikat (Bahasa Inggeris)",
    descriptionMs: "Penerangan syarikat (Bahasa Malaysia)",
    select: "Pilih",
    save: "Simpan profil syarikat",
    saving: "Menyimpan…",
    saved: "Profil syarikat telah disimpan.",
    required: "Nama syarikat diperlukan.",
    failed: "Profil tidak dapat disimpan. Sila cuba lagi.",
  },
} as const;

const states = ["Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan", "Pahang", "Penang", "Perak", "Perlis", "Sabah", "Sarawak", "Selangor", "Terengganu", "Kuala Lumpur", "Labuan", "Putrajaya"];
const industries = ["Manufacturing", "Retail", "Food & Beverage", "Logistics", "Construction", "Hospitality", "Healthcare", "Professional Services", "Technology", "Other"];

export function CompanyProfile({ initialLocale, ownerId, initialCompany }: { initialLocale: Locale; ownerId: string; initialCompany: CompanyProfileRecord }) {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(() => {
    if (!initialCompany.logo_path) return null;
    return createClient().storage.from("company-logos").getPublicUrl(initialCompany.logo_path).data.publicUrl;
  });
  const t = copy[locale];
  const initials = initialCompany.name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]?.toUpperCase()).join("") || "CO";

  function changeLocale(nextLocale: Locale) {
    setLocale(nextLocale);
    document.documentElement.lang = nextLocale;
  }

  async function logOut() {
    await createClient().auth.signOut();
    router.push("/employer/login");
    router.refresh();
  }

  async function uploadLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setMessage("");
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError(t.logoTypeError);
      event.target.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError(t.logoSizeError);
      event.target.value = "";
      return;
    }

    setUploadingLogo(true);
    const supabase = createClient();
    const path = `${ownerId}/logo`;
    const { error: uploadError } = await supabase.storage
      .from("company-logos")
      .upload(path, file, { upsert: true, contentType: file.type, cacheControl: "3600" });

    if (uploadError) {
      setUploadingLogo(false);
      setError(t.logoUploadError);
      event.target.value = "";
      return;
    }

    const { error: profileError } = await supabase
      .from("companies")
      .update({ logo_path: path, updated_at: new Date().toISOString() })
      .eq("owner_id", ownerId);

    if (profileError) {
      await supabase.storage.from("company-logos").remove([path]);
      setUploadingLogo(false);
      setError(t.logoUploadError);
      event.target.value = "";
      return;
    }

    const publicUrl = supabase.storage.from("company-logos").getPublicUrl(path).data.publicUrl;
    setLogoUrl(`${publicUrl}?v=${Date.now()}`);
    setUploadingLogo(false);
    setMessage(t.logoSaved);
    event.target.value = "";
    router.refresh();
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();

    setError("");
    setMessage("");
    if (!name) {
      setError(t.required);
      return;
    }

    setSaving(true);
    const value = (field: string) => String(data.get(field) || "").trim() || null;
    const profile = {
      name,
      registration_number: value("registration_number"),
      industry: value("industry"),
      company_size: value("company_size"),
      website: value("website"),
      phone: value("phone"),
      email: value("email"),
      address: value("address"),
      city: value("city"),
      state: value("state"),
      description_en: value("description_en"),
      description_ms: value("description_ms"),
      updated_at: new Date().toISOString(),
    };

    const supabase = createClient();
    const { data: updatedCompany, error: updateError } = await supabase
      .from("companies")
      .update(profile)
      .eq("owner_id", ownerId)
      .select("id")
      .maybeSingle();

    let saveError = updateError;
    if (!saveError && !updatedCompany) {
      const { error: insertError } = await supabase
        .from("companies")
        .insert({ owner_id: ownerId, ...profile });
      saveError = insertError;
    }

    setSaving(false);
    if (saveError) {
      setError(t.failed);
      return;
    }

    setMessage(t.saved);
    router.refresh();
  }

  const field = (value: string | null) => value ?? "";

  return (
    <div className="employer-shell">
      <aside className="dashboard-sidebar">
        <Link className="wordmark" href="/">Job<span>Linker</span></Link>
        <p>{t.dashboard}</p>
        <nav aria-label="Employer navigation">
          <Link href={`/employer/dashboard?lang=${locale}`}><HouseIcon size={19} />{t.overview}</Link>
          <Link href={`/employer/dashboard?lang=${locale}#jobs`}><BriefcaseIcon size={19} />{t.jobs}</Link>
          <Link href={`/employer/dashboard?lang=${locale}#analytics`}><ChartBarIcon size={19} />{t.analytics}</Link>
          <Link className="active" href={`/employer/company?lang=${locale}`}><GearIcon size={19} weight="fill" />{t.profile}</Link>
        </nav>
        <button className="dashboard-logout" type="button" onClick={logOut}><SignOutIcon size={18} />{t.logout}</button>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <Link className="mobile-wordmark wordmark" href="/">Job<span>Linker</span></Link>
          <div className="dashboard-company"><span>{logoUrl ? <Image src={logoUrl} width={36} height={36} alt="" /> : initials}</span><div><strong>{initialCompany.name}</strong><small>Employer account</small></div></div>
          <div className="dashboard-language" aria-label="Language selector">
            <button type="button" aria-pressed={locale === "en"} onClick={() => changeLocale("en")}>EN</button><span>|</span>
            <button type="button" aria-pressed={locale === "ms"} onClick={() => changeLocale("ms")}>BM</button>
          </div>
        </header>

        <div className="company-profile-content">
          <Link className="profile-back" href={`/employer/dashboard?lang=${locale}`}><ArrowLeftIcon size={16} />{t.back}</Link>
          <header className="profile-heading">
            <div><p>{t.eyebrow}</p><h1>{t.title}</h1><span>{t.intro}</span></div>
            <span className={`profile-verification ${initialCompany.verification_status}`}>{t.status}: {initialCompany.verification_status}</span>
          </header>

          <div className="profile-layout">
            <aside className="profile-identity">
              <div className="profile-monogram">{logoUrl ? <Image src={logoUrl} width={54} height={54} alt={`${initialCompany.name} logo`} /> : initials}</div>
              <h2>{initialCompany.name}</h2>
              <p>{t.identity}</p>
              <label className="profile-logo-upload">
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadLogo} disabled={uploadingLogo} />
                <UploadSimpleIcon size={16} />{uploadingLogo ? t.uploadingLogo : logoUrl ? t.replaceLogo : t.uploadLogo}
              </label>
              <small><BuildingsIcon size={15} />{t.logoHint}</small>
            </aside>

            <form className="profile-form" onSubmit={saveProfile}>
              <section className="profile-section">
                <header><h2>{t.basic}</h2><p>{t.basicBody}</p></header>
                <div className="profile-fields">
                  <label><span>{t.name}</span><input name="name" defaultValue={initialCompany.name} autoComplete="organization" required /></label>
                  <label><span>{t.registration}</span><input name="registration_number" defaultValue={field(initialCompany.registration_number)} /></label>
                  <label><span>{t.industry}</span><select name="industry" defaultValue={field(initialCompany.industry)}><option value="">{t.select}</option>{industries.map((item) => <option key={item}>{item}</option>)}</select></label>
                  <label><span>{t.size}</span><select name="company_size" defaultValue={field(initialCompany.company_size)}><option value="">{t.select}</option>{["1–10", "11–50", "51–200", "201–500", "501+"].map((item) => <option key={item}>{item}</option>)}</select></label>
                </div>
              </section>

              <section className="profile-section">
                <header><h2>{t.contact}</h2><p>{t.contactBody}</p></header>
                <div className="profile-fields">
                  <label><span>{t.email}</span><input name="email" type="email" defaultValue={field(initialCompany.email)} autoComplete="email" /></label>
                  <label><span>{t.phone}</span><input name="phone" type="tel" defaultValue={field(initialCompany.phone)} autoComplete="tel" /></label>
                  <label className="profile-full"><span>{t.website}</span><input name="website" type="url" placeholder="https://" defaultValue={field(initialCompany.website)} autoComplete="url" /></label>
                </div>
              </section>

              <section className="profile-section">
                <header><h2>{t.location}</h2><p>{t.locationBody}</p></header>
                <div className="profile-fields">
                  <label className="profile-full"><span>{t.address}</span><input name="address" defaultValue={field(initialCompany.address)} autoComplete="street-address" /></label>
                  <label><span>{t.city}</span><input name="city" defaultValue={field(initialCompany.city)} autoComplete="address-level2" /></label>
                  <label><span>{t.state}</span><select name="state" defaultValue={field(initialCompany.state)}><option value="">{t.select}</option>{states.map((item) => <option key={item}>{item}</option>)}</select></label>
                </div>
              </section>

              <section className="profile-section">
                <header><h2>{t.about}</h2><p>{t.aboutBody}</p></header>
                <div className="profile-fields">
                  <label className="profile-full"><span>{t.descriptionEn}</span><textarea name="description_en" rows={5} defaultValue={field(initialCompany.description_en)} /></label>
                  <label className="profile-full"><span>{t.descriptionMs}</span><textarea name="description_ms" rows={5} defaultValue={field(initialCompany.description_ms)} /></label>
                </div>
              </section>

              <footer className="profile-actions">
                <div aria-live="polite">{error && <p className="profile-error">{error}</p>}{message && <p className="profile-success">{message}</p>}</div>
                <button type="submit" disabled={saving}><FloppyDiskIcon size={17} />{saving ? t.saving : t.save}</button>
              </footer>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
