/** Small caramel pill for short facts such as "Kedi ve Köpek". Text on caramel is always navy (ADR-014). */
export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-caramel px-3 py-1 text-sm font-semibold text-navy">
      {children}
    </span>
  );
}
