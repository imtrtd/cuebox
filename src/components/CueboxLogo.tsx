import { useId } from "react";

type CueboxLogoProps = {
  className?: string;
  title?: string;
};

export function CueboxLogo({ className, title }: CueboxLogoProps) {
  const uid = useId().replace(/:/g, "");
  const bg = `cuebox-logo-bg-${uid}`;
  const shine = `cuebox-logo-shine-${uid}`;

  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id={bg} x1="16" y1="2" x2="16" y2="30">
          <stop stopColor="#B276FF" />
          <stop offset="0.48" stopColor="#7133C7" />
          <stop offset="1" stopColor="#35135F" />
        </linearGradient>
        <linearGradient id={shine} x1="8" y1="4" x2="24" y2="22">
          <stop stopColor="#FFFFFF" stopOpacity="0.28" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="9" fill={`url(#${bg})`} />
      <rect
        x="1.4"
        y="1.4"
        width="29.2"
        height="29.2"
        rx="8.6"
        fill={`url(#${shine})`}
      />
      <path
        d="M20.8 11.7a6.9 6.9 0 1 0 0 8.6"
        stroke="#FFFFFF"
        strokeWidth="3.1"
        strokeLinecap="round"
      />
      <circle cx="21.8" cy="21.8" r="1.55" fill="#EEE2FF" />
    </svg>
  );
}
