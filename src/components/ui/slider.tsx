"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  rangeClassName?: string;
  thumbLabel?: string;
}

export const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, rangeClassName, thumbLabel, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      [
        "relative",
        "flex",
        "w-full",
        "touch-none",
        "select-none",
        "items-center",
        "py-2",
      ].join(" "),
      className,
    )}
    {...props}
  >
    <SliderPrimitive.Track
      className={cn(
        [
          "relative",
          "h-2.5",
          "w-full",
          "grow",
          "overflow-hidden",
          "rounded-full",
          "bg-slate-100",
          "ring-1 ring-inset ring-slate-200/70",
          "shadow-inner shadow-slate-900/[0.03]",
        ].join(" "),
      )}
    >
      <SliderPrimitive.Range
        className={cn(
          [
            "absolute",
            "h-full",
            "rounded-full",
            "bg-gradient-to-r",
            "from-indigo-500",
            "via-indigo-500",
            "to-teal-500",
            "shadow-sm shadow-indigo-500/20",
            "transition-[width]",
            "duration-200",
            "ease-out",
          ].join(" "),
          rangeClassName,
        )}
      />
    </SliderPrimitive.Track>

    <SliderPrimitive.Thumb
      aria-label={thumbLabel}
      className={cn(
        [
          "block",
          "h-5",
          "w-5",
          "shrink-0",
          "cursor-grab",
          "rounded-full",
          "border-2",
          "border-indigo-600",
          "bg-white",
          "shadow-[0_2px_8px_rgba(79,70,229,0.22)]",
          "transition-all",
          "duration-200",
          "hover:scale-110",
          "hover:shadow-[0_3px_12px_rgba(79,70,229,0.28)]",
          "focus-visible:outline-none",
          "focus-visible:ring-4",
          "focus-visible:ring-indigo-500/20",
          "active:scale-105",
          "active:cursor-grabbing",
        ].join(" "),
      )}
    />
  </SliderPrimitive.Root>
));

Slider.displayName = "Slider";