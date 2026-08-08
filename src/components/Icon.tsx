/**
 * Counterline icon set — hand-drawn SVG primitives.
 * Uniform 24px grid, 1.5 stroke, currentColor. No icon dependency,
 * no emoji anywhere in the product.
 */

interface IconProps {
  size?: number;
  className?: string;
}

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: 'false' as const,
});

export function IconGauge({ size = 22, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M3.6 17.5a9 9 0 1 1 16.8 0" />
      <path d="M12 13.6 16 9.4" />
      <circle cx="12" cy="17.5" r="1.6" />
    </svg>
  );
}

export function IconTrend({ size = 22, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M3 19h18" />
      <path d="M6.5 15.5 11 10l3.2 3.4L20 6.5" />
      <path d="M20 10.6V6.5h-4" />
    </svg>
  );
}

export function IconVault({ size = 22, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="3" y="4.5" width="18" height="15" rx="3" />
      <circle cx="12" cy="12" r="3.6" />
      <path d="M12 6.6v1.8M12 15.6v1.8M17.4 12h-1.8M8.4 12H6.6" />
    </svg>
  );
}

export function IconStaff({ size = 22, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <circle cx="9.2" cy="8.4" r="3.4" />
      <path d="M3.2 19.4c.6-3.3 3.1-5.2 6-5.2s5.4 1.9 6 5.2" />
      <path d="M16.2 5.6a3 3 0 0 1 0 5.8" />
      <path d="M17.6 14.6c2.1.5 3.4 2.2 3.8 4.8" />
    </svg>
  );
}

export function IconStock({ size = 22, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M3.5 8.2 12 3.6l8.5 4.6v7.6L12 20.4 3.5 15.8Z" />
      <path d="M3.5 8.2 12 12.8l8.5-4.6" />
      <path d="M12 12.8v7.6" />
    </svg>
  );
}

export function IconLedger({ size = 22, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="2.8" y="5.2" width="18.4" height="13.6" rx="3" />
      <path d="M2.8 9.8h18.4" />
      <path d="M6.6 14.8h4.2" />
    </svg>
  );
}

export function IconGrid({ size = 22, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <circle cx="6" cy="6" r="1.4" />
      <circle cx="12" cy="6" r="1.4" />
      <circle cx="18" cy="6" r="1.4" />
      <circle cx="6" cy="12" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="18" cy="12" r="1.4" />
      <circle cx="6" cy="18" r="1.4" />
      <circle cx="12" cy="18" r="1.4" />
      <circle cx="18" cy="18" r="1.4" />
    </svg>
  );
}

export function IconRefresh({ size = 20, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M20 12a8 8 0 1 1-2.6-5.9" />
      <path d="M20.2 4.4v4.2H16" />
    </svg>
  );
}

export function IconSignOut({ size = 20, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M14.4 4.6H6.8a2 2 0 0 0-2 2v10.8a2 2 0 0 0 2 2h7.6" />
      <path d="M18.6 12H10" />
      <path d="m15.8 8.8 3.2 3.2-3.2 3.2" />
    </svg>
  );
}

export function IconAlert({ size = 18, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 7.8v4.8" />
      <path d="M12 16.1h.01" />
    </svg>
  );
}

export function IconCheck({ size = 18, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <circle cx="12" cy="12" r="8.6" />
      <path d="m8.4 12.2 2.5 2.5 4.7-5" />
    </svg>
  );
}

export function IconStar({ size = 13, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path
        d="m12 4.4 2.3 4.9 5.2.7-3.8 3.7.9 5.2-4.6-2.5-4.6 2.5.9-5.2L4.5 10l5.2-.7Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

export function IconClock({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 7.6V12l2.8 1.8" />
    </svg>
  );
}

export function IconEye({ size = 20, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  );
}

export function IconEyeOff({ size = 20, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M9.6 6.2A9.4 9.4 0 0 1 12 5.8c6 0 9.5 6.2 9.5 6.2a17 17 0 0 1-3 3.8" />
      <path d="M6.4 7.9A16.8 16.8 0 0 0 2.5 12S6 18.2 12 18.2a9.6 9.6 0 0 0 3.6-.7" />
      <path d="M10.2 10.3a2.8 2.8 0 0 0 3.8 3.9" />
      <path d="m4.4 4.4 15.2 15.2" />
    </svg>
  );
}

export function IconInbox({ size = 20, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M3.4 13.4 6 5.6h12l2.6 7.8v4a2 2 0 0 1-2 2H5.4a2 2 0 0 1-2-2Z" />
      <path d="M3.4 13.4h4.2l1.2 2.2h6.4l1.2-2.2h4.2" />
    </svg>
  );
}

export function IconArrow({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M5 12h13" />
      <path d="m13 7 5 5-5 5" />
    </svg>
  );
}
