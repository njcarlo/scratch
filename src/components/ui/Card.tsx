import clsx from "clsx";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-xl2 bg-white p-4 shadow-card border border-ink-50",
        className
      )}
      {...props}
    />
  );
}
