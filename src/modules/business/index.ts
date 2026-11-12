// Public API of the business module (ADR-001): import only from here.
export {
  getBusinessProfile,
  getOpeningHours,
  type BusinessProfile,
  type OpeningHour,
} from "./data/business-repo";
export { WHATSAPP_GREETING } from "./domain/contact";
export { ContactChannels } from "./ui/contact-channels";
export { MapEmbed } from "./ui/map-embed";
export { OpeningHours } from "./ui/opening-hours";
export { WhatsappButton } from "./ui/whatsapp-button";
