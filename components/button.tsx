import Link from "next/link";

type Variant = "solid" | "outline" | "red";

const base =
  "label group relative inline-flex items-center justify-center gap-2.5 " +
  "px-7 py-4 transition-colors duration-300 select-none";

const variants: Record<Variant, string> = {
  solid: "bg-ink text-bone hover:bg-red",
  outline: "border border-ink text-ink hover:bg-ink hover:text-bone",
  red: "bg-red text-white hover:bg-ink",
};

function Arrow() {
  return (
    <span
      aria-hidden="true"
      className="inline-block transition-transform duration-300 group-hover:translate-x-1"
    >
      →
    </span>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "solid",
  arrow = false,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Link>, "href" | "className"> & {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  arrow?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`${base} ${variants[variant]} ${className ?? ""}`}
      {...props}
    >
      {children}
      {arrow && <Arrow />}
    </Link>
  );
}

export function Button({
  children,
  variant = "solid",
  arrow = false,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  variant?: Variant;
  arrow?: boolean;
}) {
  return (
    <button
      className={`${base} ${variants[variant]} disabled:cursor-not-allowed disabled:opacity-40 ${className ?? ""}`}
      {...props}
    >
      {children}
      {arrow && <Arrow />}
    </button>
  );
}

/** Small uppercase label with the red bullet the design uses above headings. */
export function Eyebrow({
  children,
  className,
  tone = "text-red",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: string;
}) {
  return (
    <p className={`label ${tone} ${className ?? ""}`}>{children}</p>
  );
}
