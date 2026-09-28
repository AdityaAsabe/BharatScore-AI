import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  [
    "inline-flex items-center justify-center",
    "gap-1.5",
    "whitespace-nowrap",
    "rounded-full",
    "px-2.5 py-1",
    "text-xs font-semibold leading-none",
    "transition-all duration-200",
    "select-none",
    "[&_svg]:size-3.5",
    "[&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-indigo-50",
          "text-indigo-700",
          "ring-1 ring-inset ring-indigo-200",
          "shadow-[0_1px_2px_rgba(79,70,229,0.06)]",
        ].join(" "),

        teal: [
          "bg-teal-50",
          "text-teal-700",
          "ring-1 ring-inset ring-teal-200",
          "shadow-[0_1px_2px_rgba(13,148,136,0.06)]",
        ].join(" "),

        amber: [
          "bg-amber-50",
          "text-amber-700",
          "ring-1 ring-inset ring-amber-200",
          "shadow-[0_1px_2px_rgba(245,158,11,0.06)]",
        ].join(" "),

        rose: [
          "bg-rose-50",
          "text-rose-700",
          "ring-1 ring-inset ring-rose-200",
          "shadow-[0_1px_2px_rgba(244,63,94,0.06)]",
        ].join(" "),

        green: [
          "bg-emerald-50",
          "text-emerald-700",
          "ring-1 ring-inset ring-emerald-200",
          "shadow-[0_1px_2px_rgba(16,185,129,0.06)]",
        ].join(" "),

        slate: [
          "bg-slate-100",
          "text-slate-700",
          "ring-1 ring-inset ring-slate-200",
          "shadow-[0_1px_2px_rgba(15,23,42,0.05)]",
        ].join(" "),
      },
    },

    defaultVariants: {
      variant: "default",
    },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}