"use client";

import { useActionState } from "react";
import type { FormState } from "@/shared/lib/form-state";
import { FormMessage, SubmitButton, TextArea, Field } from "@/shared/ui/form";

type Texts = {
  hero_title: string;
  hero_subtitle: string;
  hero_text: string;
  welcome_text: string;
  about_markdown: string;
};

/** Metinler: the homepage texts and the About page. */
export function SiteTextsForm({
  texts,
  action,
}: {
  texts: Texts;
  action: (state: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction] = useActionState(action, {});
  const value = (name: keyof Texts) => state.values?.[name] ?? texts[name];
  const error = (name: keyof Texts) => state.fieldErrors?.[name];

  return (
    <form action={formAction} className="space-y-8" noValidate>
      <FormMessage
        error={
          state.fieldErrors
            ? "Bazı alanlar hatalı. Lütfen işaretli alanları düzeltin."
            : state.error
        }
        message={state.message}
      />

      <fieldset className="space-y-5 rounded-2xl bg-white p-5">
        <legend className="px-1 font-heading text-lg font-extrabold">Anasayfa girişi</legend>
        <Field
          label="Başlık"
          name="hero_title"
          required
          maxLength={120}
          defaultValue={value("hero_title")}
          error={error("hero_title")}
          hint="Anasayfanın en üstündeki büyük yazı."
        />
        <Field
          label="Alt başlık"
          name="hero_subtitle"
          maxLength={160}
          defaultValue={value("hero_subtitle")}
          error={error("hero_subtitle")}
        />
        <TextArea
          label="Giriş metni"
          name="hero_text"
          rows={3}
          maxLength={400}
          defaultValue={value("hero_text")}
          error={error("hero_text")}
        />
      </fieldset>

      <fieldset className="space-y-5 rounded-2xl bg-white p-5">
        <legend className="px-1 font-heading text-lg font-extrabold">Hoş geldiniz</legend>
        <TextArea
          label="Hoş geldiniz metni"
          name="welcome_text"
          rows={5}
          maxLength={1500}
          defaultValue={value("welcome_text")}
          error={error("welcome_text")}
          hint="Anasayfada fotoğrafın yanında görünür."
        />
      </fieldset>

      <fieldset className="space-y-5 rounded-2xl bg-white p-5">
        <legend className="px-1 font-heading text-lg font-extrabold">Hakkımızda sayfası</legend>
        <TextArea
          label="Hakkımızda metni"
          name="about_markdown"
          rows={12}
          maxLength={10000}
          defaultValue={value("about_markdown")}
          error={error("about_markdown")}
          hint="Paragraflar arasında bir boş satır bırakın. ## ile başlayan satır ara başlık olur, - ile başlayan satırlar madde işareti olur."
        />
      </fieldset>

      <div className="max-w-xs">
        <SubmitButton pending="Kaydediliyor…">Kaydet</SubmitButton>
      </div>
    </form>
  );
}
