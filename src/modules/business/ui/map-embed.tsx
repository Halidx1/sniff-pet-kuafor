import type { BusinessProfile } from "../data/business-repo";
import { mapEmbedUrl } from "../domain/contact";

/** Lazy-loaded Google Maps iframe; never wider than its container (SPEC §8). */
export function MapEmbed({
  profile,
  className = "",
}: {
  profile: BusinessProfile;
  className?: string;
}) {
  return (
    <iframe
      src={mapEmbedUrl(profile)}
      title="Sniff Pet Kuaför'ün haritadaki konumu"
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
      className={`aspect-[4/3] w-full rounded-3xl border-0 bg-beige ${className}`}
    />
  );
}
