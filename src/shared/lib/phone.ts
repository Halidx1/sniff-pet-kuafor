// Phone helpers for numbers stored as E.164 (+90XXXXXXXXXX, enforced by the database).

/** "+905321234567" → "0532 123 45 67" */
export function formatPhoneTr(e164: string): string {
  const d = e164.replace(/^\+90/, "");
  return `0${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 8)} ${d.slice(8, 10)}`;
}

export function telHref(e164: string): string {
  return `tel:${e164}`;
}

/** wa.me link with an optional prefilled message. */
export function whatsappHref(e164: string, message?: string): string {
  const base = `https://wa.me/${e164.replace(/^\+/, "")}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
