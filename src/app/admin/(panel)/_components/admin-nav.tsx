"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Sections of the panel (SPEC §14). Later M3 PRs add their entries here. */
const SECTIONS = [
  { href: "/admin", label: "Panel" },
  { href: "/admin/hesap", label: "Hesap" },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav aria-label="Panel bölümleri" className="mx-auto max-w-5xl overflow-x-auto px-4">
      <ul className="flex gap-1">
        {SECTIONS.map(({ href, label }) => {
          const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                prefetch={false}
                aria-current={active ? "page" : undefined}
                className="inline-flex min-h-11 items-center border-b-3 border-transparent px-3 font-heading font-bold whitespace-nowrap aria-[current=page]:border-caramel"
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
