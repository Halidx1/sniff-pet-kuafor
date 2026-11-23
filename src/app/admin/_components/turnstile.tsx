"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type TurnstileApi = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

/**
 * Cloudflare Turnstile (PLAN T1): Supabase Auth checks the token on sign-in and password
 * reset. Rendered only when a site key is configured (the cloud projects); local and CI
 * run without a captcha. The token travels in a hidden `captchaToken` field.
 */
export function Turnstile({
  siteKey,
  nonce,
  resetOn,
}: {
  siteKey?: string;
  nonce?: string;
  /** The form's last result: each new one means the token was used, so get a new one. */
  resetOn?: unknown;
}) {
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const [token, setToken] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!siteKey || !loaded || !box.current || !window.turnstile) return;
    const id = (widget.current = window.turnstile.render(box.current, {
      sitekey: siteKey,
      language: "tr",
      callback: setToken,
      "expired-callback": () => setToken(""),
    }));
    return () => {
      widget.current = null;
      window.turnstile?.remove(id);
    };
  }, [siteKey, loaded]);

  // Tokens are single-use: after every attempt (wrong password, etc.) get a fresh one.
  useEffect(() => {
    if (resetOn === undefined || !widget.current) return;
    setToken("");
    window.turnstile?.reset(widget.current);
  }, [resetOn]);

  if (!siteKey) return null;
  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        nonce={nonce}
        onReady={() => setLoaded(true)}
      />
      <div ref={box} className="min-h-[65px]" />
      <input type="hidden" name="captchaToken" value={token} />
    </>
  );
}
