import type { OpeningHour } from "../data/business-repo";
import { weeklyHours } from "../domain/contact";

/** Weekly hours, or nothing at all until the owner has entered them (no invented facts). */
export function OpeningHours({ rows }: { rows: OpeningHour[] }) {
  const week = weeklyHours(rows);
  if (week.length === 0) return null;
  return (
    <section aria-labelledby="hours-heading">
      <h2 id="hours-heading" className="text-2xl font-extrabold tracking-tight">
        Çalışma saatleri
      </h2>
      <dl className="mt-4 divide-y divide-beige rounded-2xl bg-oat-light px-5">
        {week.map(({ day, hours }) => (
          <div key={day} className="flex justify-between gap-4 py-3">
            <dt className="font-semibold">{day}</dt>
            <dd className={hours === "Kapalı" ? "text-muted-text" : ""}>{hours}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
