"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { NAV_LINKS } from "./nav";

/** Hamburger menu in a native <dialog>: focus is trapped, Escape closes, focus returns to the button. */
export function MobileMenu() {
  const dialog = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  useEffect(() => dialog.current?.close(), [pathname]); // close after navigating

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        aria-label="Menüyü aç"
        aria-haspopup="dialog"
        className="inline-flex size-12 items-center justify-center rounded-full hover:bg-cream lg:hidden"
      >
        <Menu aria-hidden="true" />
      </button>
      <dialog
        ref={dialog}
        aria-label="Menü"
        onClick={(e) => e.target === dialog.current && dialog.current.close()}
        className="ms-auto me-0 h-dvh max-h-dvh w-[min(85vw,22rem)] bg-neutral-bg p-6 text-navy backdrop:bg-navy/60"
      >
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label="Menüyü kapat"
            className="inline-flex size-12 items-center justify-center rounded-full hover:bg-cream"
          >
            <X aria-hidden="true" />
          </button>
        </div>
        <nav aria-label="Mobil menü">
          <ul className="mt-4 space-y-1">
            <li>
              <Link
                href="/"
                className="block rounded-2xl px-4 py-3 font-heading text-lg font-bold hover:bg-cream"
              >
                Anasayfa
              </Link>
            </li>
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={pathname === href ? "page" : undefined}
                  className="block rounded-2xl px-4 py-3 font-heading text-lg font-bold hover:bg-cream aria-[current=page]:bg-cream"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Link
          href="/randevu-al"
          className="mt-6 flex min-h-12 items-center justify-center rounded-full bg-navy px-6 font-heading font-bold text-cream"
        >
          Randevu Al
        </Link>
      </dialog>
    </>
  );
}
