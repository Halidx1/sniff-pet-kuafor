import { connection } from "next/server";
import { publicClient } from "@/shared/supabase/public-client";

// Used by the keep-alive workflow: one tiny database query keeps the Supabase
// project from pausing (PLAN R2). Says nothing about the database beyond up/down.
export async function GET() {
  await connection(); // run per request, never prerendered
  const ok = await databaseIsUp();
  return Response.json(
    { ok },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}

async function databaseIsUp(): Promise<boolean> {
  try {
    const { data, error } = await publicClient().rpc("health_check");
    if (error) console.error("health check failed:", error.message);
    return !error && data === true;
  } catch (error) {
    console.error("health check failed:", error instanceof Error ? error.message : error);
    return false;
  }
}
