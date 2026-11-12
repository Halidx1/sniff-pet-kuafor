// Public API of the catalog module (ADR-001): import only from here.
export {
  getPublishedAddons,
  getPublishedServices,
  type Addon,
  type Service,
} from "./data/catalog-repo";
export { PriceList, pricedServices } from "./ui/price-list";
export { ServiceList } from "./ui/service-list";
