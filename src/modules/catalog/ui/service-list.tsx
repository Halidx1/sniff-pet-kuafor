import { CalendarCheck } from "lucide-react";
import { getPublishedMediaByIds, MediaImage } from "@/modules/media";
import { Badge } from "@/shared/ui/badge";
import { ButtonLink } from "@/shared/ui/button";
import type { Service } from "../data/catalog-repo";
import { PET_SCOPE_LABEL } from "../domain/labels";
import { groupByCategory, tierRows } from "../domain/price-display";

/** Services grouped by category (SPEC §9). Prices and durations only appear once confirmed. */
export async function ServiceList({
  services,
  headingLevel = "h2",
}: {
  services: Service[];
  headingLevel?: "h2" | "h3";
}) {
  const images = await getPublishedMediaByIds(
    services.flatMap((s) => (s.image_id ? [s.image_id] : [])),
  );
  const Heading = headingLevel;
  return (
    <div className="space-y-14">
      {groupByCategory(services).map((group) => (
        <section key={group.category} aria-labelledby={`cat-${group.category}`}>
          <Heading
            id={`cat-${group.category}`}
            className="text-2xl font-extrabold tracking-tight sm:text-3xl"
          >
            {group.label}
          </Heading>
          <ul className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {group.services.map((service) => {
              const image = images.find((m) => m.id === service.image_id);
              const rows = tierRows(service.service_prices);
              return (
                <li key={service.id} className="flex flex-col overflow-hidden rounded-3xl bg-white">
                  {image && (
                    <MediaImage
                      image={image}
                      sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 92vw"
                      className="aspect-[3/2] w-full object-cover"
                    />
                  )}
                  <div className="flex flex-1 flex-col gap-4 p-6">
                    <div>
                      <h3 className="text-xl font-extrabold">{service.name}</h3>
                      <div className="mt-2">
                        <Badge>{PET_SCOPE_LABEL[service.pet_scope]}</Badge>
                      </div>
                    </div>
                    {service.description && (
                      <p className="leading-relaxed">{service.description}</p>
                    )}
                    {rows.length > 0 && (
                      <dl className="divide-y divide-beige text-sm">
                        {rows.map((row) => (
                          <div
                            key={row.tier}
                            className="flex flex-wrap justify-between gap-x-4 py-2"
                          >
                            <dt className="font-semibold">{row.label}</dt>
                            <dd className="text-right">
                              {row.price}
                              {row.duration && (
                                <span className="block text-muted-text">
                                  yaklaşık {row.duration}
                                </span>
                              )}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    )}
                    <ButtonLink
                      href={`/randevu-al?hizmet=${service.id}`}
                      variant="secondary"
                      className="mt-auto"
                    >
                      <CalendarCheck className="size-5" aria-hidden="true" />
                      Randevu Al
                    </ButtonLink>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
