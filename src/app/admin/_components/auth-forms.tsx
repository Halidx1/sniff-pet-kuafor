"use client";

import { useActionState, useState } from "react";
// Type-only: erased at build time, so no server code reaches the browser.
import type { FormState, SetupState } from "@/modules/identity";
import { Button } from "@/shared/ui/button";
import { Field, FormMessage, SubmitButton } from "@/shared/ui/form";
import { Turnstile } from "./turnstile";

type Action<S> = (state: S, formData: FormData) => Promise<S>;

export function SignInForm({
  action,
  next,
  siteKey,
  nonce,
}: {
  action: Action<FormState>;
  next?: string;
  siteKey?: string;
  nonce?: string;
}) {
  const [state, formAction] = useActionState(action, {});
  return (
    <form action={formAction} className="space-y-5" noValidate>
      <FormMessage error={state.error} />
      <Field
        label="E-posta"
        name="email"
        type="email"
        autoComplete="username"
        inputMode="email"
        required
        error={state.fieldErrors?.email}
      />
      <Field
        label="Şifre"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        error={state.fieldErrors?.password}
      />
      {next && <input type="hidden" name="next" value={next} />}
      <Turnstile siteKey={siteKey} nonce={nonce} resetOn={state} />
      <SubmitButton pending="Giriş yapılıyor…">Giriş yap</SubmitButton>
    </form>
  );
}

export function CodeForm({ action, next }: { action: Action<FormState>; next?: string }) {
  const [state, formAction] = useActionState(action, {});
  return (
    <form action={formAction} className="space-y-5" noValidate>
      <FormMessage error={state.error} />
      <CodeField error={state.fieldErrors?.code} />
      {next && <input type="hidden" name="next" value={next} />}
      <SubmitButton pending="Doğrulanıyor…">Doğrula</SubmitButton>
    </form>
  );
}

function CodeField({ error }: { error?: string }) {
  return (
    <Field
      label="6 haneli kod"
      name="code"
      inputMode="numeric"
      autoComplete="one-time-code"
      pattern="[0-9]{6}"
      maxLength={6}
      required
      autoFocus
      error={error}
      className="mt-2 block min-h-14 w-full rounded-xl border-2 border-navy/30 bg-white px-4 text-center font-heading text-2xl tracking-[0.4em] focus:border-navy aria-invalid:border-danger"
    />
  );
}

/** First sign-in: start → scan the QR code (or type the key) → confirm with one code. */
export function SetupFlow({
  start,
  confirm,
  next,
}: {
  start: () => Promise<SetupState>;
  confirm: Action<SetupState>;
  next?: string;
}) {
  const [state, formAction] = useActionState(confirm, {});
  const [setup, setSetup] = useState<SetupState | null>(null);
  const [starting, setStarting] = useState(false);
  const current = state.factorId ? state : setup;

  if (!current?.factorId) {
    return (
      <div className="space-y-5">
        <FormMessage error={setup?.error} />
        <ol className="list-decimal space-y-2 pl-5 leading-relaxed">
          <li>
            Telefonunuza bir doğrulama uygulaması yükleyin (ör. Google Authenticator veya Microsoft
            Authenticator).
          </li>
          <li>Aşağıdaki düğmeye basın; ekranda bir QR kod belirecek.</li>
        </ol>
        <Button
          className="w-full"
          disabled={starting}
          onClick={async () => {
            setStarting(true);
            setSetup(await start());
            setStarting(false);
          }}
        >
          {starting ? "Hazırlanıyor…" : "Kurulumu başlat"}
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <p className="leading-relaxed">
        Uygulamada <strong>QR kod tara</strong> seçeneğiyle bu kodu okutun:
      </p>
      {/* The QR code is an SVG data URL from Supabase (allowed by the admin CSP's img-src data:). */}
      {/* eslint-disable-next-line @next/next/no-img-element -- data URL, nothing to optimise */}
      <img
        src={current.qr}
        alt="Doğrulama uygulaması için QR kod"
        width={200}
        height={200}
        className="mx-auto size-52 rounded-xl border-2 border-beige bg-white p-2"
      />
      <details className="rounded-xl bg-neutral-bg p-3">
        <summary className="cursor-pointer font-semibold">QR kodu okutamıyorum</summary>
        <p className="mt-2 text-sm">Uygulamaya bu anahtarı elle girin:</p>
        <code data-testid="totp-secret" className="mt-1 block font-mono text-sm break-all">
          {current.secret}
        </code>
      </details>
      <FormMessage error={state.error} />
      <input type="hidden" name="factorId" value={current.factorId} />
      {next && <input type="hidden" name="next" value={next} />}
      <CodeField error={state.fieldErrors?.code} />
      <SubmitButton pending="Doğrulanıyor…">Kurulumu tamamla</SubmitButton>
    </form>
  );
}

export function ResetRequestForm({
  action,
  siteKey,
  nonce,
}: {
  action: Action<FormState>;
  siteKey?: string;
  nonce?: string;
}) {
  const [state, formAction] = useActionState(action, {});
  if (state.message) return <FormMessage message={state.message} />;
  return (
    <form action={formAction} className="space-y-5" noValidate>
      <Field
        label="E-posta"
        name="email"
        type="email"
        autoComplete="username"
        inputMode="email"
        required
        error={state.fieldErrors?.email}
      />
      <Turnstile siteKey={siteKey} nonce={nonce} resetOn={state} />
      <SubmitButton pending="Gönderiliyor…">Sıfırlama bağlantısı gönder</SubmitButton>
    </form>
  );
}

export function PasswordForm({ action }: { action: Action<FormState> }) {
  const [state, formAction] = useActionState(action, {});
  return (
    <form action={formAction} className="space-y-5" noValidate>
      <FormMessage error={state.error} message={state.message} />
      <Field
        label="Yeni şifre"
        name="password"
        type="password"
        autoComplete="new-password"
        hint="En az 12 karakter. Bir cümle de olabilir, ör. üç kelime ve bir sayı."
        required
        error={state.fieldErrors?.password}
      />
      <Field
        label="Yeni şifre (tekrar)"
        name="confirm"
        type="password"
        autoComplete="new-password"
        required
        error={state.fieldErrors?.confirm}
      />
      <SubmitButton pending="Kaydediliyor…">Şifreyi değiştir</SubmitButton>
    </form>
  );
}
