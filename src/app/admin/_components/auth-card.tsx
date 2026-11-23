import Image from "next/image";

/** The frame around every sign-in step: logo, title, short explanation, the form. */
export function AuthCard({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center px-4 py-12">
      {/* unoptimized: the logo is served as-is (ADR-008), never resized out of proportion */}
      <Image
        src="/brand/logo-interim.png"
        alt="Sniff Pet Kuaför"
        width={879}
        height={482}
        unoptimized
        className="h-14 w-auto self-start"
      />
      <p className="mt-2 font-heading text-sm font-bold tracking-wide text-muted-text uppercase">
        Yönetim paneli
      </p>
      <div className="mt-8 rounded-3xl bg-white p-6 shadow-[0_12px_40px_-24px_rgb(7_21_43/0.35)] sm:p-8">
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        {intro && <div className="mt-3 leading-relaxed">{intro}</div>}
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}
