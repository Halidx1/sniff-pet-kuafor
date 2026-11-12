// Public API of the business module (ADR-001): import only from here.
export {
  getBusinessProfile,
  getOpeningHours,
  type BusinessProfile,
  type OpeningHour,
} from "./data/business-repo";
export { WHATSAPP_GREETING } from "./domain/contact";
export { ContactChannels } from "./ui/contact-channels";
export { DirectionsLink } from "./ui/directions-link";
export { LocationMap } from "./ui/location-map";
export { OpeningHours } from "./ui/opening-hours";
export { WhatsappButton } from "./ui/whatsapp-button";
