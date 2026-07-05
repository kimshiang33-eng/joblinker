import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLogin } from "@/components/admin-login";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin login | JobLinker",
  description: "Authorised access to the JobLinker administration panel.",
};

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: admin } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
    if (admin) redirect("/admin");
  }

  const { error } = await searchParams;
  return <AdminLogin initialAccessError={error === "access"} />;
}
