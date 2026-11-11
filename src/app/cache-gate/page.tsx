// TEMPORARY (ADR-018 gate, issue #19): verifies on-demand revalidation of
// Cache Components on Netlify. Never merged.
import { cacheLife, cacheTag, updateTag } from "next/cache";
import { publicClient } from "@/shared/supabase/public-client";

async function getStamp() {
  "use cache";
  cacheLife("max");
  cacheTag("gate");
  const { data } = await publicClient().from("site_texts").select("hero_title").single();
  return { at: new Date().toISOString(), title: data?.hero_title ?? "(no data)" };
}

async function expireGate() {
  "use server";
  updateTag("gate");
}

export default async function CacheGatePage() {
  const stamp = await getStamp();
  return (
    <main className="p-8">
      <h1>Cache gate</h1>
      <p data-testid="stamp">{stamp.at}</p>
      <p data-testid="title">{stamp.title}</p>
      <form action={expireGate}>
        <button type="submit">updateTag</button>
      </form>
    </main>
  );
}
