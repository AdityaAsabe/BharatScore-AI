"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string;
}

export function Progress({
  value = 0,
  className,
  indicatorClassName,
  ...props
}: ProgressProps) {
  const safeValue = Math.min(100, Math.max(0, value ?? 0));

  return (
    <ProgressPrimitive.Root
      value={safeValue}
      className={cn(
        [
          "relative",
          "h-2.5",
          "w-full",
          "overflow-hidden",
          "rounded-full",
          "bg-slate-100",
          "ring-1 ring-inset ring-slate-200/70",
          "shadow-inner shadow-slate-900/[0.03]",
        ].join(" "),
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          [
            "relative",
            "h-full",
            "rounded-full",
            "bg-gradient-to-r",
            "from-indigo-500",
            "via-indigo-500",
            "to-teal-500",
            "shadow-sm shadow-indigo-500/20",
            "transition-[width]",
            "duration-700",
            "ease-out",
          ].join(" "),
          indicatorClassName,
        )}
        style={{
          width: `${safeValue}%`,
        }}
      />
    </ProgressPrimitive.Root>
  );
}