// Turkish formatting helpers (tr-TR, ₺). Pure functions, no I/O.

const lira = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});
const liraWithKurus = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  minimumFractionDigits: 2,
});

/** 1250 → "₺1.250", 1250.5 → "₺1.250,50" */
export function formatTry(amount: number): string {
  return Number.isInteger(amount) ? lira.format(amount) : liraWithKurus.format(amount);
}

// Turkish suffixes follow the *spoken* last word of a number: 1250 is "bin iki
// yüz elli", so it ends in "elli" → 'den. Vowel harmony picks e/a, a voiceless
// final consonant (ç, ş, t, k…) turns d into t.
const AFTER_UNIT = ["", "'den", "'den", "'ten", "'ten", "'ten", "'dan", "'den", "'den", "'dan"]; // bir iki üç dört beş altı yedi sekiz dokuz
const AFTER_TEN = ["", "'dan", "'den", "'dan", "'tan", "'den", "'tan", "'ten", "'den", "'dan"]; // on yirmi otuz kırk elli altmış yetmiş seksen doksan

/** The ablative suffix ("-den/-dan/-ten/-tan") for a non-negative number as Turks read it aloud. */
export function ablativeSuffix(amount: number): string {
  const cents = Math.round((amount % 1) * 100);
  const n = cents > 0 ? cents : Math.floor(amount); // "… lira elli kuruş" ends with the kuruş
  if (n === 0) return "'dan"; // sıfır
  if (n % 1_000_000 === 0) return "'dan"; // milyon, milyar
  if (n % 1000 === 0) return "'den"; // bin
  const lastGroup = n % 1000;
  if (lastGroup % 100 === 0) return "'den"; // yüz
  const lastTwo = lastGroup % 100;
  return lastTwo % 10 === 0 ? AFTER_TEN[lastTwo / 10]! : AFTER_UNIT[lastTwo % 10]!;
}

/** 45 → "45 dakika", 60 → "1 saat", 90 → "1 saat 30 dakika" */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} dakika`;
  return rest === 0 ? `${hours} saat` : `${hours} saat ${rest} dakika`;
}
