import type { BusinessProfile } from "../data/business-repo";
import { hasLocation } from "../domain/map-style";
import { ShopMap } from "./shop-map";

/** The shop map, or nothing while no coordinates are stored (nothing is guessed). */
export function LocationMap({
  profile,
  className,
}: {
  profile: BusinessProfile;
  className?: string;
}) {
  const position = { latitude: profile.latitude, longitude: profile.longitude };
  if (!hasLocation(position)) return null;
  return <ShopMap {...position} mapsUrl={profile.maps_url} className={className} />;
}
