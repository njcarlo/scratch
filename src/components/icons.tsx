/**
 * Small hand-rolled icon set — avoids an extra icon-library dependency for
 * a handful of glyphs. All icons are `currentColor` and take a `className`,
 * so size/color follow Tailwind text utilities on the parent.
 */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...props,
});

export const HomeIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
  </svg>
);

export const CycleIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3.5" y="4.5" width="17" height="16" rx="2.5" />
    <path d="M3.5 9.5h17" />
    <path d="M8 3v3M16 3v3" />
    <circle cx="12" cy="15" r="2.4" />
  </svg>
);

export const FoodIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M7 3v7a2 2 0 0 0 4 0V3M9 10v11" />
    <path d="M17 3c-1.7 0-3 2-3 5s1.3 5 3 5v8" />
  </svg>
);

export const InsightsIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 20V10M11 20V4M18 20v-7" />
    <path d="M3 20h18" />
  </svg>
);

export const HealthIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M20.8 8.6c0 5-8.8 10.4-8.8 10.4S3.2 13.6 3.2 8.6a4.6 4.6 0 0 1 8.4-2.6 4.6 4.6 0 0 1 9.2 2.6Z" />
    <path d="M8 12h2l1.2-2.4L12.6 13l1-2h2.4" />
  </svg>
);

export const ProfileIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
  </svg>
);

export const SparkleIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
    <circle cx="12" cy="12" r="2.3" />
  </svg>
);

export const CommunityIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="8.5" cy="9" r="2.8" />
    <circle cx="16" cy="10" r="2.2" />
    <path d="M3.2 19c.6-3 2.6-4.7 5.3-4.7s4.7 1.7 5.3 4.7M14.7 19c.4-2.1 1.7-3.5 3.9-3.7" />
  </svg>
);

export const HeartHandIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 21s-6.5-4.4-9-8.2C1.3 9.7 2.5 6.5 5.6 6c2-.3 3.4.7 4.4 2 .1.1.3.1.4 0 1-1.3 2.4-2.3 4.4-2 3.1.5 4.3 3.7 2.6 6.8-2.5 3.8-9 8.2-9 8.2" />
  </svg>
);

export const ChevronRightIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);
export const ChevronLeftIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m15 6-6 6 6 6" />
  </svg>
);
export const PlusIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const CheckIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m5 13 4 4L19 7" />
  </svg>
);
export const XIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
export const InfoIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5.5M12 8v.01" />
  </svg>
);
export const TrashIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 12.5A1.5 1.5 0 0 0 9.5 21h5a1.5 1.5 0 0 0 1.5-1.5L17 7" />
  </svg>
);
export const DropletIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3s6 6.7 6 11a6 6 0 0 1-12 0c0-4.3 6-11 6-11Z" />
  </svg>
);
export const ScaleIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3v18M7 7h10M4 7l2.5 5a2.5 2.5 0 0 0 5 0L14 7M14 7l2.5 5a2.5 2.5 0 0 0 5 0L19 7" />
  </svg>
);
export const PillIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3.5" y="8.5" width="17" height="7" rx="3.5" transform="rotate(-30 12 12)" />
    <path d="m10.2 8.6 3.6 6.8" />
  </svg>
);
export const StethoscopeIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 4v5.5a4.5 4.5 0 0 0 9 0V4" />
    <circle cx="19" cy="15.5" r="2" />
    <path d="M15 9.5v3a4.5 4.5 0 0 1-9 0V4M17 15.5a6 6 0 0 1-12 0" />
  </svg>
);
