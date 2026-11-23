import { connection, NextResponse, type NextRequest } from "next/server";
import { adminClient } from "@/shared/supabase/admin-client";

// Ends a session that may not use the panel (signed in with 2FA but not on the admin
// list) and shows the reason. A route handler, because pages can't clear cookies.
export async function GET(request: NextRequest) {
  await connection();
  const supabase = await adminClient();
  await supabase.auth.signOut({ scope: "local" });
  const reason = request.nextUrl.searchParams.get("hata") === "yetki" ? "?hata=yetki" : "";
  return NextResponse.redirect(new URL(`/admin/giris${reason}`, request.url));
}
