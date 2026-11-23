"use client";

import { useActionState } from "react";
import type { FormState } from "@/shared/lib/form-state";
import { Field, FormMessage, Select, SubmitButton } from "@/shared/ui/form";
import { CATEGORY_OPTIONS } from "./media-uploader";

type Details = { id: string; alt_text: string; caption: string | null; category: string | null };

/** Edits one photo's texts. Saving also confirms a demo photo (the owner has checked it). */
export function MediaDetailsForm({
  photo,
  showCategory,
  action,
}: {
  photo: Details;
  showCategory: boolean;
  action: (state: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction] = useActionState(action, {});
  const value = (name: "alt_text" | "caption" | "category") =>
    state.values?.[name] ?? photo[name] ?? "";
  const id = (name: string) => `${photo.id}-${name}`;
  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="id" value={photo.id} />
      <Field
        id={id("alt")}
        label="Fotoğrafta ne görünüyor?"
        name="alt_text"
        required
        maxLength={200}
        defaultValue={value("alt_text")}
        error={state.fieldErrors?.alt_text}
      />
      <Field
        id={id("caption")}
        label="Alt yazı (isteğe bağlı)"
        name="caption"
        maxLength={300}
        defaultValue={value("caption")}
        error={state.fieldErrors?.caption}
      />
      {showCategory ? (
        <Select
          id={id("category")}
          label="Kedi mi, köpek mi?"
          name="category"
          options={CATEGORY_OPTIONS}
          defaultValue={value("category")}
        />
      ) : (
        <input type="hidden" name="category" value={value("category")} />
      )}
      <FormMessage error={state.error} message={state.message} />
      <div className="max-w-56">
        <SubmitButton pending="Kaydediliyor…">Kaydet</SubmitButton>
      </div>
    </form>
  );
}
