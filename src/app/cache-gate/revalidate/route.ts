// TEMPORARY (ADR-018 gate, issue #19). Never merged.
import { revalidateTag } from "next/cache";

export async function POST() {
  revalidateTag("gate", "max");
  return Response.json({ revalidated: true });
}
