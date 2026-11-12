"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "./nav";

/** Desktop links; the current page gets aria-current and a caramel underline. */
export function NavLinks() {
  const pathname = usePathname();
  return (
    <ul className="hidden items-center gap-1 lg:flex">
      {NAV_LINKS.map(({ href, label }) => (
        <li key={href}>
          <Link
            href={href}
            aria-current={pathname === href ? "page" : undefined}
            className="rounded-full px-3 py-2 font-heading font-semibold decoration-caramel decoration-[3px] underline-offset-8 hover:underline aria-[current=page]:underline"
          >
            {label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
