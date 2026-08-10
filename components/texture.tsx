/**
 * Collage primitives. Everything here is inline SVG or CSS so the page carries
 * its own texture — no image requests for the decorative layer.
 */

type Deco = { className?: string; style?: React.CSSProperties };

/** Hand-drawn red brush stroke. The loudest element in the palette — use sparingly. */
export function BrushStroke({
  className,
  style,
  color = "var(--color-red)",
}: Deco & { color?: string }) {
  return (
    <svg
      viewBox="0 0 420 96"
      className={className}
      style={style}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path
        fill={color}
        d="M6 54c22-9 47-16 74-21 31-6 55-7 88-6 21 1 39 4 62 8 19 3 33 4 50 3 14-1 27-4 41-8 12-3 24-8 37-14 9-4 15-6 22-6 6 0 10 3 9 8-1 6-8 12-20 19-16 9-33 16-53 22-24 7-45 10-70 11-27 1-49-1-77-5-25-4-44-6-67-6-26 0-47 3-72 9-16 4-27 7-38 11-8 3-13 4-17 2-4-2-4-7-1-12 4-6 12-11 32-15z"
      />
      <path
        fill={color}
        opacity="0.86"
        d="M28 70c34-11 63-16 100-17 26-1 47 1 75 5 22 3 39 4 58 3 17-1 31-4 46-9 6-2 10-1 10 3 0 5-6 9-18 14-19 7-38 11-60 12-27 2-49 0-78-4-24-3-43-4-66-3-25 1-45 5-70 12-9 3-15 2-16-2-1-5 4-10 19-14z"
      />
    </svg>
  );
}

/** Torn paper strip — the collage seam that divides the hero. */
export function TornStrip({ className, style }: Deco) {
  return (
    <svg
      viewBox="0 0 120 900"
      className={className}
      style={style}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="strip-g" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#efeade" />
          <stop offset="55%" stopColor="#fbfaf7" />
          <stop offset="100%" stopColor="#e4dece" />
        </linearGradient>
      </defs>
      <path
        fill="url(#strip-g)"
        d="M34 0l52 0-6 42 9 38-11 44 7 40-8 46 10 42-6 44 8 40-9 46 6 42-10 44 9 40-7 46 10 42-6 44 7 40-9 46 8 42-6 44 9 40-7 44H30l7-44-9-40 6-44-8-42 9-46-7-40 6-44-9-42 7-46-8-40 9-44-6-44 10-42-9-46 8-40-7-44 10-42-9-44 6-38z"
      />
      <path
        fill="#111"
        opacity="0.07"
        d="M34 0l10 0-8 42 9 38-11 44 7 40-8 46 10 42-6 44 8 40-9 46 6 42-10 44 9 40-7 46 10 42-6 44 7 40-9 46 8 42-6 44 9 40-7 44H30l7-44-9-40 6-44-8-42 9-46-7-40 6-44-9-42 7-46-8-40 9-44-6-44 10-42-9-46 8-40-7-44 10-42-9-44 6-38z"
      />
    </svg>
  );
}

/** Small torn tape square — the bits of paper scattered through the collage. */
export function TapeScrap({
  className,
  style,
  tone = "#e6e0d0",
}: Deco & { tone?: string }) {
  return (
    <svg
      viewBox="0 0 160 70"
      className={className}
      style={style}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path
        fill={tone}
        d="M3 8l24-5 22 4 26-6 21 5 24-4 17 6-2 17 4 16-3 14-19 5-23-4-25 6-22-5-21 4-20-6 2-15-5-16z"
      />
      <path
        fill="#111"
        opacity="0.06"
        d="M3 8l24-5 22 4 26-6 21 5 24-4 17 6-160 0z"
      />
    </svg>
  );
}

/** Halftone dot block — photocopy grain, used as depth behind photos. */
export function HalftoneBlock({
  className,
  style,
  tone = "text-ink/45",
}: Deco & { tone?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`halftone-fade ${tone} ${className ?? ""}`}
      style={style}
    />
  );
}

/** Horizontal torn seam used between full-width sections. */
export function TornSeam({
  className,
  fill = "var(--color-bone)",
  flip = false,
}: {
  className?: string;
  fill?: string;
  flip?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 1200 26"
      className={className}
      aria-hidden="true"
      preserveAspectRatio="none"
      style={flip ? { transform: "scaleY(-1)" } : undefined}
    >
      <path
        fill={fill}
        d="M0 26h1200V9l-28 5-31-8-26 9-34-6-29 7-32-9-27 6-33-4-30 8-28-7-34 5-29-9-26 8-33-6-30 7-27-8-34 6-29-5-26 9-32-7-30 5-27-8-33 7-29-6-27 8-32-5-30 6-28-9-33 6-29-7-26 8-32-6-30 7-27-9-33 6-29-5-27 8-31-7z"
      />
    </svg>
  );
}

/** Crosshair register mark — the print-shop detail in the corners. */
export function RegisterMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path d="M12 0v24M0 12h24" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
