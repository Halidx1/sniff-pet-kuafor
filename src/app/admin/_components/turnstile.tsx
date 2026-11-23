"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type TurnstileApi = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
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
export function Turnstile({ siteKey, nonce }: { siteKey?: string; nonce?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [token, setToken] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!siteKey || !loaded || !box.current || !window.turnstile) return;
    const id = window.turnstile.render(box.current, {
      sitekey: siteKey,
      language: "tr",
      callback: setToken,
      "expired-callback": () => setToken(""),
    });
    return () => window.turnstile?.remove(id);
  }, [siteKey, loaded]);

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
