import { Mail, MessageCircle, Phone } from "lucide-react";
import { InstagramIcon } from "@/shared/ui/icons";
import { formatPhoneTr, telHref, whatsappHref } from "@/shared/lib/phone";
import type { BusinessProfile } from "../data/business-repo";
import { WHATSAPP_GREETING } from "../domain/contact";

/** Every contact channel that is actually set; empty ones are simply not shown (SPEC §5). */
export function ContactChannels({
  profile,
  className = "",
}: {
  profile: BusinessProfile;
  className?: string;
}) {
  const channels = [
    profile.phone_e164 && {
      href: telHref(profile.phone_e164),
      icon: <Phone className="size-5" aria-hidden="true" />,
      label: formatPhoneTr(profile.phone_e164),
      hint: "Arayın",
    },
    profile.whatsapp_e164 && {
      href: whatsappHref(profile.whatsapp_e164, WHATSAPP_GREETING),
      icon: <MessageCircle className="size-5" aria-hidden="true" />,
      label: "WhatsApp ile yazın",
      hint: formatPhoneTr(profile.whatsapp_e164),
    },
    profile.instagram_url && {
      href: profile.instagram_url,
      icon: <InstagramIcon />,
      label: "@sniffpetkuafor",
      hint: "Instagram'dan mesaj gönderin",
    },
    profile.email && {
      href: `mailto:${profile.email}`,
      icon: <Mail className="size-5" aria-hidden="true" />,
      label: profile.email,
      hint: "E-posta gönderin",
    },
  ].filter(Boolean) as { href: string; icon: React.ReactNode; label: string; hint: string }[];

  return (
    <ul className={`space-y-3 ${className}`}>
      {channels.map((c) => (
        <li key={c.href}>
          <a
            href={c.href}
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-2xl bg-sky-light p-4 transition-colors hover:bg-cream"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-navy text-cream">
              {c.icon}
            </span>
            <span>
              <span className="block font-heading font-bold">{c.label}</span>
              <span className="block text-sm text-muted-text">{c.hint}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
