"use client";

import { useActionState } from "react";
import type { FormState } from "@/shared/lib/form-state";
import { formatPhoneTr } from "@/shared/lib/phone";
import { Field, FormMessage, SubmitButton } from "@/shared/ui/form";

type Profile = {
  business_name: string;
  slogan: string | null;
  address: string;
  maps_url: string | null;
  instagram_url: string | null;
  phone_e164: string | null;
  whatsapp_e164: string | null;
  email: string | null;
  latitude: number | null;
  longitude: number | null;
};

/** İşletme Bilgileri (SPEC §14.9). After an error the typed values stay in the fields. */
export function BusinessProfileForm({
  profile,
  action,
}: {
  profile: Profile;
  action: (state: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction] = useActionState(action, {});
  const initial: Record<string, string> = {
    business_name: profile.business_name,
    slogan: profile.slogan ?? "",
    address: profile.address,
    maps_url: profile.maps_url ?? "",
    instagram_url: profile.instagram_url ?? "",
    phone_e164: profile.phone_e164 ? formatPhoneTr(profile.phone_e164) : "",
    whatsapp_e164: profile.whatsapp_e164 ? formatPhoneTr(profile.whatsapp_e164) : "",
    email: profile.email ?? "",
    latitude: profile.latitude?.toString() ?? "",
    longitude: profile.longitude?.toString() ?? "",
  };
  const value = (name: string) => state.values?.[name] ?? initial[name];
  const error = (name: string) => state.fieldErrors?.[name];

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
        <legend className="px-1 font-heading text-lg font-extrabold">İşletme</legend>
        <Field
          label="İşletme adı"
          name="business_name"
          required
          defaultValue={value("business_name")}
          error={error("business_name")}
        />
        <Field
          label="Slogan"
          name="slogan"
          defaultValue={value("slogan")}
          error={error("slogan")}
          hint="Sitenin alt kısmında görünür. Boş bırakılabilir."
        />
      </fieldset>

      <fieldset className="space-y-5 rounded-2xl bg-white p-5">
        <legend className="px-1 font-heading text-lg font-extrabold">İletişim</legend>
        <Field
          label="Telefon"
          name="phone_e164"
          type="tel"
          inputMode="tel"
          autoComplete="off"
          defaultValue={value("phone_e164")}
          error={error("phone_e164")}
          hint="Ör. 0532 123 45 67. Boş bırakılırsa sitede telefon gösterilmez."
        />
        <Field
          label="WhatsApp"
          name="whatsapp_e164"
          type="tel"
          inputMode="tel"
          autoComplete="off"
          defaultValue={value("whatsapp_e164")}
          error={error("whatsapp_e164")}
          hint="Genellikle telefonla aynı numara. Sitedeki WhatsApp düğmeleri bu numarayı kullanır."
        />
        <Field
          label="E-posta"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="off"
          defaultValue={value("email")}
          error={error("email")}
        />
        <Field
          label="Instagram profil bağlantısı"
          name="instagram_url"
          type="url"
          inputMode="url"
          defaultValue={value("instagram_url")}
          error={error("instagram_url")}
          hint="Ör. https://www.instagram.com/sniffpetkuafor/"
        />
      </fieldset>

      <fieldset className="space-y-5 rounded-2xl bg-white p-5">
        <legend className="px-1 font-heading text-lg font-extrabold">Adres ve harita</legend>
        <Field
          label="Adres"
          name="address"
          required
          defaultValue={value("address")}
          error={error("address")}
        />
        <Field
          label="Google Haritalar bağlantısı"
          name="maps_url"
          type="url"
          inputMode="url"
          defaultValue={value("maps_url")}
          error={error("maps_url")}
          hint="“Yol Tarifi Al” düğmesi bu bağlantıyı açar. Google Haritalar’da işletmeyi açıp “Paylaş → Bağlantıyı kopyala” ile alabilirsiniz."
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Enlem"
            name="latitude"
            inputMode="decimal"
            defaultValue={value("latitude")}
            error={error("latitude")}
            hint="Haritadaki pati işaretinin yeri, ör. 39.797668"
          />
          <Field
            label="Boylam"
            name="longitude"
            inputMode="decimal"
            defaultValue={value("longitude")}
            error={error("longitude")}
            hint="Ör. 32.802474. İkisi de boşsa harita gösterilmez."
          />
        </div>
      </fieldset>

      <div className="max-w-xs">
        <SubmitButton pending="Kaydediliyor…">Kaydet</SubmitButton>
      </div>
    </form>
  );
}
