import { z } from "zod";

// Metinler form: homepage texts and the About page (SPEC §8, §11), same limits as the DB.

const text = (max: number, label: string, required = false) => {
  const base = z.string().trim().max(max, `${label} en fazla ${max} karakter olabilir.`);
  return required ? base.min(1, `${label} boş bırakılamaz.`) : base;
};

export const siteTextsSchema = z.object({
  hero_title: text(120, "Başlık", true),
  hero_subtitle: text(160, "Alt başlık"),
  hero_text: text(400, "Giriş metni"),
  welcome_text: text(1500, "Hoş geldiniz metni"),
  about_markdown: text(10000, "Hakkımızda metni"),
});

export type SiteTextsInput = z.infer<typeof siteTextsSchema>;
