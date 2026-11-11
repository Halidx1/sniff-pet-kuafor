import { describe, expect, it } from "vitest";
import { requiredEnv } from "@/shared/lib/env";
import { visitor } from "./clients";

// What the public REST API exposes to a visitor holding the publishable key
// (threat T4). pgTAP covers the rules; this checks the real HTTP surface.
describe("public REST API as a visitor", () => {
  it("shows the business profile and texts", async () => {
    const profile = await visitor.from("business_profile").select("business_name").single();
    expect(profile.data?.business_name).toBe("Sniff Pet Kuaför");
    const texts = await visitor.from("site_texts").select("hero_title").single();
    expect(texts.error).toBeNull();
  });

  it("hides demo drafts", async () => {
    for (const table of ["services", "service_prices", "addons", "faq_items"] as const) {
      const { data, error } = await visitor.from(table).select("id");
      expect(error, table).toBeNull();
      expect(data, table).toEqual([]);
    }
  });

  it("shows only published images", async () => {
    // Stock photos may be published as decoration while staying flagged demo (SPEC §15).
    const { data, error } = await visitor.from("media").select("is_published");
    expect(error).toBeNull();
    expect(data?.every((row) => row.is_published)).toBe(true);
  });

  it("refuses internal closure notes and the private schema", async () => {
    const notes = await visitor.from("closures").select("internal_note");
    expect(notes.error?.code).toBe("42501");
    // @ts-expect-error: private tables are not part of the API types, on purpose
    const admins = await visitor.from("admins").select("*");
    expect(admins.error).not.toBeNull();
    // Asking PostgREST for the private schema directly is refused too.
    const audit = await fetch(`${requiredEnv("SUPABASE_URL")}/rest/v1/audit_log`, {
      headers: { apikey: requiredEnv("SUPABASE_PUBLISHABLE_KEY"), "Accept-Profile": "private" },
    });
    expect(audit.ok).toBe(false);
  });

  it("refuses writes", async () => {
    const { error } = await visitor.from("business_profile").update({ slogan: "x" }).eq("id", true);
    expect(error?.code).toBe("42501");
  });

  it("answers the health check", async () => {
    const { data } = await visitor.rpc("health_check");
    expect(data).toBe(true);
  });
});
