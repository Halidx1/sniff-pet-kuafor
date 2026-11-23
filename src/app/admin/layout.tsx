import type { Metadata } from "next";
import { connection } from "next/server";

// Every admin page renders at request time (no prerendered shell): the strict CSP from
// proxy.ts carries a per-request nonce, and Next.js can only put it on the scripts of a
// page it renders for that request (ADR-006). `instant = false` allows this blocking
// render under Cache Components.
export const instant = false;

export const metadata: Metadata = {
  title: { default: "Yönetim Paneli", template: "%s | Yönetim Paneli | Sniff Pet Kuaför" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await connection();
  return <div className="min-h-svh bg-neutral-bg">{children}</div>;
}
