import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";
import { CheckIcon } from "../icons";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export function Chip({ selected, className, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={clsx(
        "inline-flex min-h-[44px] items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        selected
          ? "border-teal-600 bg-teal-600 text-white"
          : "border-ink-100 bg-white text-ink-800 hover:border-teal-300",
        className
      )}
      {...props}
    >
      {selected && <CheckIcon className="h-3.5 w-3.5" />}
      {children}
    </button>
  );
}
