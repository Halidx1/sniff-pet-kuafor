import { formatDuration } from "@/shared/lib/format";
import type { Addon, Service } from "../data/catalog-repo";
import { PET_SCOPE_LABEL } from "../domain/labels";
import { priceLabel, tierRows } from "../domain/price-display";

/** Services that have at least one confirmed price; the pricing page shows a fallback otherwise. */
export function pricedServices(services: Service[]) {
  return services.filter((s) => s.service_prices.length > 0);
}

/** One small table per service: readable on a phone without sideways scrolling (SPEC §10). */
export function PriceList({ services, addons }: { services: Service[]; addons: Addon[] }) {
  return (
    <div className="space-y-6">
      {pricedServices(services).map((service) => (
        <section
          key={service.id}
          aria-labelledby={`price-${service.id}`}
          className="rounded-3xl bg-sky-light p-6"
        >
          <h2 id={`price-${service.id}`} className="text-xl font-extrabold">
            {service.name}
          </h2>
          <table className="mt-4 w-full table-fixed text-left">
            <thead className="text-sm text-muted-text">
              <tr>
                <th scope="col" className="w-2/5 pb-2 font-semibold sm:w-1/3">
                  Boyut
                </th>
                <th scope="col" className="pb-2 font-semibold">
                  Fiyat
                </th>
                <th scope="col" className="hidden w-1/4 pb-2 font-semibold sm:table-cell">
                  Tahmini süre
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige">
              {tierRows(service.service_prices).map((row) => (
                <tr key={row.tier}>
                  <th scope="row" className="py-3 pr-4 font-semibold">
                    {row.label}
                  </th>
                  <td className="py-3 pr-4">
                    {row.price}
                    {row.duration && (
                      <span className="block text-sm text-muted-text sm:hidden">
                        yaklaşık {row.duration}
                      </span>
                    )}
                  </td>
                  <td className="hidden py-3 sm:table-cell">{row.duration ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      {addons.length > 0 && (
        <section aria-labelledby="addons-heading" className="rounded-3xl bg-cream p-6">
          <h2 id="addons-heading" className="text-xl font-extrabold">
            Ek hizmetler
          </h2>
          <ul className="mt-4 divide-y divide-beige">
            {addons.map((addon) => (
              <li
                key={addon.id}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3"
              >
                <span>
                  <span className="font-semibold">{addon.name}</span>
                  <span className="block text-sm text-muted-text">
                    {PET_SCOPE_LABEL[addon.pet_scope]}
                    {addon.duration_min > 0 && `, ek süre ${formatDuration(addon.duration_min)}`}
                  </span>
                </span>
                <span>{priceLabel(addon)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
