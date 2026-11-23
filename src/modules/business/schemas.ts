import { z } from "zod";
import { normalizePhoneTr } from "@/shared/lib/phone";

// İşletme Bilgileri form (SPEC §14.9), checked again by the database constraints.

/** Empty → null, otherwise trimmed and at most `max` characters. */
const optionalText = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .transform((value) => value || null);

const optionalPhone = z
  .string()
  .trim()
  .transform((value, ctx) => {
    if (!value) return null;
    const e164 = normalizePhoneTr(value);
    if (!e164) {
      ctx.addIssue({
        code: "custom",
        message: "Geçerli bir telefon numarası girin (ör. 0532 123 45 67).",
      });
      return z.NEVER;
    }
    return e164;
  });

const optionalCoordinate = (min: number, max: number) =>
  z
    .string()
    .trim()
    .transform((value, ctx) => {
      if (!value) return null;
      const n = Number(value.replace(",", "."));
      if (!Number.isFinite(n) || n < min || n > max) {
        ctx.addIssue({ code: "custom", message: "Geçerli bir koordinat girin (ör. 39.797668)." });
        return z.NEVER;
      }
      return Math.round(n * 1e6) / 1e6;
    });

export const businessProfileSchema = z
  .object({
    business_name: z
      .string()
      .trim()
      .min(1, "İşletme adını girin.")
      .max(100, "En fazla 100 karakter."),
    slogan: optionalText(200, "En fazla 200 karakter."),
    address: z.string().trim().min(1, "Adresi girin.").max(300, "En fazla 300 karakter."),
    maps_url: optionalText(500, "Bağlantı çok uzun.").refine(
      (value) => value === null || /^https:\/\/\S+$/.test(value),
      "https:// ile başlayan bir bağlantı girin.",
    ),
    instagram_url: optionalText(200, "Bağlantı çok uzun.").refine(
      (value) => value === null || /^https:\/\/(www\.)?instagram\.com\/\S+$/.test(value),
      "Instagram profil bağlantısını girin (https://www.instagram.com/…).",
    ),
    phone_e164: optionalPhone,
    whatsapp_e164: optionalPhone,
    email: optionalText(254, "En fazla 254 karakter.").refine(
      (value) => value === null || z.email().safeParse(value).success,
      "Geçerli bir e-posta adresi girin.",
    ),
    latitude: optionalCoordinate(-90, 90),
    longitude: optionalCoordinate(-180, 180),
  })
  .refine((v) => (v.latitude === null) === (v.longitude === null), {
    path: ["longitude"],
    message: "Enlem ve boylamı birlikte girin (ya da ikisini de boş bırakın).",
  });

export type BusinessProfileInput = z.infer<typeof businessProfileSchema>;
