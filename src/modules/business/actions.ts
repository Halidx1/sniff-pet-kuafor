"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/modules/identity";
import { formValues, toFieldErrors, type FormState } from "@/shared/lib/form-state";
import { updateBusinessProfile } from "./data/business-admin-repo";
import { businessProfileSchema } from "./schemas";

// Use cases: requireAdmin → Zod → repository → refresh the public pages (ADR-018).

export async function saveBusinessProfile(_: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const values = formValues(formData);
  const parsed = businessProfileSchema.safeParse(values);
  if (!parsed.success) return { values, fieldErrors: toFieldErrors(parsed.error.issues) };
  await updateBusinessProfile(parsed.data);
  updateTag("business");
  return { message: "Kaydedildi. Değişiklikler sitede birkaç saniye içinde görünür." };
}
