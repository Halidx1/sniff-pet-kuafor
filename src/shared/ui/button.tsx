import Link from "next/link";

type Variant = "primary" | "secondary" | "light";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-navy text-cream hover:bg-navy/90",
  secondary: "border-2 border-navy text-navy hover:bg-navy hover:text-cream",
  light: "bg-cream text-navy hover:bg-white", // on navy backgrounds
};

const BASE =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 text-center font-heading font-bold transition-colors";

type Props = { href: string; variant?: Variant; className?: string; children: React.ReactNode };

/** A link styled as a button. Internal paths use next/link; anything else opens normally. */
export function ButtonLink({ href, variant = "primary", className = "", children }: Props) {
  const classes = `${BASE} ${VARIANTS[variant]} ${className}`;
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={classes} rel="noopener noreferrer">
      {children}
    </a>
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant };

/** A real <button> with the same look (forms, actions). */
export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${BASE} ${VARIANTS[variant]} disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    />
  );
}
