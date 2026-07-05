import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const requestedNext = searchParams.get("next");
  const next = requestedNext?.startsWith("/employer/") ? requestedNext : "/employer/dashboard";
  const supabase = await createClient();

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
      : { error: new Error("Missing confirmation token") };

  if (error) {
    return NextResponse.redirect(new URL("/employer/login?error=confirmation", request.url));
  }

  const { data: { user } } = await supabase.auth.getUser();
  const companyName = user?.user_metadata.company_name;

  if (user && typeof companyName === "string" && companyName.trim()) {
    await supabase.from("companies").upsert({
      owner_id: user.id,
      name: companyName.trim(),
      phone: typeof user.user_metadata.phone === "string" ? user.user_metadata.phone : null,
      email: user.email ?? null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "owner_id" });
  }

  return NextResponse.redirect(new URL(next, request.url));
}
