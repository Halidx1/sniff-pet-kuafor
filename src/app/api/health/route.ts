import { connection } from "next/server";

// Liveness probe for the keep-alive workflow (PLAN §8 R2). From M1 on it also does a tiny DB read
// so Supabase sees activity. The response never contains data.
export async function GET() {
  await connection(); // run per request, never prerendered
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
