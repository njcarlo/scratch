import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-700 disabled:bg-ink-100 disabled:text-ink-400",
  secondary:
    "bg-cream-100 text-ink-800 border border-ink-100 hover:bg-cream-200 disabled:text-ink-400",
  ghost: "bg-transparent text-teal-700 hover:bg-teal-50 disabled:text-ink-400",
  danger:
    "bg-transparent text-blush-700 hover:bg-blush-50 disabled:text-ink-400",
};

export function Button({
  variant = "primary",
  fullWidth,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-xl2 px-5 py-3 text-[15px] font-medium transition-colors",
        "min-h-[48px]", // generous touch target, Section 26
        variantClasses[variant],
        fullWidth && "w-full",
        className
      )}
      {...props}
    />
  );
}
