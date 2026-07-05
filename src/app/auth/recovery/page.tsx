import type { Metadata } from "next";
import { RecoveryCallback } from "@/components/recovery-callback";

export const metadata: Metadata = {
  title: "Recover employer account | JobLinker",
  description: "Securely continue to reset your JobLinker employer password.",
};

export default function RecoveryPage() {
  return <RecoveryCallback />;
}
