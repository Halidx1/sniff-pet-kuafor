import { z } from "zod";

// Input checks at the boundary (CLAUDE.md), shared by forms and Server Actions.
// Messages are Turkish because they're shown next to the fields.

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "Geçerli bir e-posta adresi girin." }))
  .refine((value) => value.length <= 254, "Geçerli bir e-posta adresi girin.");

const captchaToken = z
  .string()
  .max(4096)
  .optional()
  .transform((value) => value || undefined);

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Şifrenizi girin.").max(200),
  captchaToken,
  next: z.string().max(500).optional(),
});

export const codeSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "6 haneli kodu girin."),
  next: z.string().max(500).optional(),
});

export const setupSchema = codeSchema.extend({
  factorId: z.uuid(),
});

export const resetRequestSchema = z.object({ email, captchaToken });

/** SPEC §14 / PLAN T1: at least 12 characters (Supabase checks the same). */
export const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(12, "Şifre en az 12 karakter olmalı.")
      .max(72, "Şifre en fazla 72 karakter olabilir."),
    confirm: z.string(),
  })
  .refine((value) => value.password === value.confirm, {
    path: ["confirm"],
    error: "Şifreler aynı değil.",
  });
