import type { Metadata } from "next";
import { DM_Sans, Nunito_Sans } from "next/font/google";
import "./globals.css";

// latin-ext covers ş ğ ü ö ç İ ı, so Turkish text never falls back to another font.
const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin", "latin-ext"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Sniff Pet Kuaför | Kedi ve Köpek Bakımında Profesyonel Dokunuş",
    template: "%s | Sniff Pet Kuaför",
  },
  description:
    "Sniff Pet Kuaför, Gölbaşı / Ankara'da kedi ve köpekler için özenli ve profesyonel bakım hizmeti.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // lang="tr" makes CSS uppercase map i → İ correctly.
    <html lang="tr" className={`${nunitoSans.variable} ${dmSans.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
