import Image from "next/image";
import Link from "next/link";
import { requireAdmin, signOut } from "@/modules/identity";
import { AdminNav } from "./_components/admin-nav";

// The signed-in panel. requireAdmin() is the real gate (proxy.ts only routes):
// a session with 2FA for someone on the admin list, or off to sign-in.
export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  const admin = await requireAdmin();
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-beige bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
          <Link href="/admin" prefetch={false} className="flex items-center gap-3 rounded-lg">
            {/* unoptimized: the logo is served as-is (ADR-008) */}
            <Image
              src="/brand/logo-interim.png"
              alt=""
              width={879}
              height={482}
              unoptimized
              className="h-10 w-auto"
            />
            <span className="font-heading font-bold">Yönetim Paneli</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-text sm:inline">{admin.displayName}</span>
            <form action={signOut}>
              <button
                type="submit"
                className="min-h-11 rounded-full border-2 border-navy px-4 font-heading text-sm font-bold"
              >
                Çıkış
              </button>
            </form>
          </div>
        </div>
        <AdminNav />
      </header>
      <main id="main" className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        {children}
      </main>
    </>
  );
}
