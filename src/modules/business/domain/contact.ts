// Pure display rules for contact facts. No I/O.

export const WHATSAPP_GREETING = "Merhaba, Sniff Pet Kuaför hakkında bilgi almak istiyorum.";

/** The stored embed URL, or a key-less Google Maps embed built from the address. */
export function mapEmbedUrl(profile: { map_embed_url: string | null; address: string }): string {
  return (
    profile.map_embed_url ??
    `https://www.google.com/maps?q=${encodeURIComponent(profile.address)}&output=embed`
  );
}

const WEEKDAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

/** "09:00:00" → "09:00" */
const hhmm = (time: string) => time.slice(0, 5);

/**
 * One row per weekday (ISO 1 = Pazartesi). Days without intervals are "Kapalı".
 * Returns [] while no hours have been entered, so nothing invented is shown.
 */
export function weeklyHours(rows: { weekday: number; opens_at: string; closes_at: string }[]) {
  if (rows.length === 0) return [];
  return WEEKDAYS.map((day, i) => {
    const intervals = rows
      .filter((r) => r.weekday === i + 1)
      .map((r) => `${hhmm(r.opens_at)}–${hhmm(r.closes_at)}`);
    return { day, hours: intervals.length ? intervals.join(", ") : "Kapalı" };
  });
}
