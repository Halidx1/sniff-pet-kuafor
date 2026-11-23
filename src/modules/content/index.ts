// Public API of the content module (ADR-001): import only from here.
export { getPublishedFaq, getSiteTexts } from "./data/content-repo";
export { KVKK_NOTICE } from "./kvkk-notice";
export { FaqList } from "./ui/faq-list";
// Admin (M3): Metinler.
export { saveSiteTexts } from "./actions";
export { getSiteTextsForAdmin } from "./data/content-admin-repo";
export { SiteTextsForm } from "./ui/site-texts-form";
