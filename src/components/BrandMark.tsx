/** Cuebox mark: an open box (the container) holding a pulse dot (the cue). */
export function BrandMark({ size = 36 }: { size?: number }) {
  return (
    <svg
      className="brand-mark-svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      aria-hidden
    >
      <rect width="64" height="64" rx="16" fill="var(--mark-tile, #0B0B10)" />
      <rect
        x=".5"
        y=".5"
        width="63"
        height="63"
        rx="15.5"
        stroke="var(--mark-edge, rgba(255,255,255,.1))"
      />
      <path
        d="M43 18H25.5A7.5 7.5 0 0 0 18 25.5v13A7.5 7.5 0 0 0 25.5 46H43"
        stroke="var(--mark-ink, #F4F2EC)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle className="brand-mark-pulse" cx="42" cy="32" r="5" fill="var(--pulse, #D8FF00)" />
    </svg>
  );
}

export function BrandWordmark({ children = "cuebox" }: { children?: React.ReactNode }) {
  return (
    <span className="brand-word">
      {children}
    </span>
  );
}
