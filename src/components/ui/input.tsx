import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      [
        "flex h-11 w-full",
        "rounded-xl",
        "border border-slate-200",
        "bg-white",
        "px-3.5",
        "text-sm font-medium text-slate-900",
        "placeholder:text-slate-400",
        "shadow-sm shadow-slate-900/[0.03]",
        "transition-all duration-200",
        "hover:border-slate-300",
        "focus-visible:border-indigo-500",
        "focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-indigo-500/20",
        "focus-visible:shadow-sm focus-visible:shadow-indigo-500/10",
        "disabled:cursor-not-allowed",
        "disabled:bg-slate-50",
        "disabled:text-slate-400",
        "disabled:opacity-70",
        "file:mr-3",
        "file:border-0",
        "file:bg-transparent",
        "file:text-sm",
        "file:font-medium",
        "file:text-slate-700",
      ].join(" "),
      className,
    )}
    {...props}
  />
));

Input.displayName = "Input";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      [
        "flex h-11 w-full",
        "appearance-none",
        "rounded-xl",
        "border border-slate-200",
        "bg-white",
        "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='m4 6 4 4 4-4'/%3E%3C/svg%3E\")]",
        "bg-[right_0.75rem_center]",
        "bg-no-repeat",
        "px-3.5 pr-9",
        "text-sm font-medium text-slate-900",
        "shadow-sm shadow-slate-900/[0.03]",
        "transition-all duration-200",
        "hover:border-slate-300",
        "focus-visible:border-indigo-500",
        "focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-indigo-500/20",
        "focus-visible:shadow-sm focus-visible:shadow-indigo-500/10",
        "disabled:cursor-not-allowed",
        "disabled:bg-slate-50",
        "disabled:text-slate-400",
        "disabled:opacity-70",
      ].join(" "),
      className,
    )}
    {...props}
  />
));

Select.displayName = "Select";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        [
          "text-sm",
          "font-semibold",
          "leading-none",
          "text-slate-700",
          "transition-colors",
        ].join(" "),
        className,
      )}
      {...props}
    />
  );
}