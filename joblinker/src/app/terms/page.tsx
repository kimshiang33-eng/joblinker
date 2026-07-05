import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal-document";

export const metadata: Metadata = { title: "Terms of Use | JobLinker", description: "Terms governing employer use of JobLinker." };

export default async function TermsPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const { lang } = await searchParams;
  return <LegalDocument kind="terms" initialLocale={lang === "ms" ? "ms" : "en"} />;
}
