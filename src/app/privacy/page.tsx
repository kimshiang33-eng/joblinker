import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal-document";

export const metadata: Metadata = { title: "Privacy Policy | JobLinker", description: "How JobLinker handles personal data." };

export default async function PrivacyPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const { lang } = await searchParams;
  return <LegalDocument kind="privacy" initialLocale={lang === "ms" ? "ms" : "en"} />;
}
