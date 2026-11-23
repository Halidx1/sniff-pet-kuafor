"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/modules/identity";
import { formValues, toFieldErrors, type FormState } from "@/shared/lib/form-state";
import { updateSiteTexts } from "./data/content-admin-repo";
import { siteTextsSchema } from "./schemas";

// Use cases: requireAdmin → Zod → repository → refresh the public pages (ADR-018).

export async function saveSiteTexts(_: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const values = formValues(formData);
  const parsed = siteTextsSchema.safeParse(values);
  if (!parsed.success) return { values, fieldErrors: toFieldErrors(parsed.error.issues) };
  await updateSiteTexts(parsed.data);
  updateTag("content");
  return { message: "Kaydedildi. Değişiklikler sitede birkaç saniye içinde görünür." };
}
