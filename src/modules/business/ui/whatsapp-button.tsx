import { MessageCircle } from "lucide-react";
import { whatsappHref } from "@/shared/lib/phone";
import { WHATSAPP_GREETING } from "../domain/contact";

/** Floating "WhatsApp ile Yazın" button, rendered only when a number is set (SPEC §7). */
export function WhatsappButton({ number }: { number: string | null }) {
  if (!number) return null;
  return (
    <a
      href={whatsappHref(number, WHATSAPP_GREETING)}
      rel="noopener noreferrer"
      className="fixed right-4 bottom-24 z-30 inline-flex items-center gap-2 rounded-full bg-navy px-4 py-3 font-heading font-bold text-cream shadow-lg md:bottom-6"
    >
      <MessageCircle className="size-5" aria-hidden="true" />
      WhatsApp ile Yazın
    </a>
  );
}
