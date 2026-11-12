/** White surface for grouped content (service cards, contact blocks). */
export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl bg-sky-light p-6 shadow-[0_1px_2px_rgb(7_21_43/0.06),0_8px_24px_rgb(7_21_43/0.06)] ${className}`}
    >
      {children}
    </div>
  );
}
