import { COMPANY, PETAL_COLORS } from './site';

// The logo mark: a blue ring with an orange swoosh cutting through it, matching the brand
// collateral. Drawn as SVG rather than shipped as a bitmap so it stays crisp at any size and
// recolours with the palette.
export function Logo({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label={`${COMPANY.name} logo`}>
      <circle cx="24" cy="24" r="20" fill="none" stroke="var(--blue)" strokeWidth="7" />
      {/* The swoosh: an arc sweeping across the ring, open at the lower right. */}
      <path
        d="M40 15 A20 20 0 1 0 42 30 L24 30"
        fill="none"
        stroke="var(--brand)"
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  );
}

// The quarter-circle motif that runs through the brand's printed work. Decorative only, so it is
// hidden from assistive technology -- a screen reader announcing eight coloured shapes would be
// noise, not information.
export function Petals({ spots }) {
  return (
    <div className="petals" aria-hidden="true">
      {spots.map((s, i) => (
        <span
          key={i}
          className={`petal petal-${s.corner}`}
          style={{
            top: s.top, left: s.left, right: s.right, bottom: s.bottom,
            width: s.size, height: s.size,
            background: PETAL_COLORS[i % PETAL_COLORS.length],
            opacity: s.opacity ?? 0.85,
          }}
        />
      ))}
    </div>
  );
}
