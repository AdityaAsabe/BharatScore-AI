import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center",
    "gap-2",
    "whitespace-nowrap",
    "rounded-xl",
    "text-sm font-semibold leading-none",
    "transition-all duration-200 ease-out",
    "cursor-pointer",
    "select-none",
    "focus-visible:outline-none",
    "focus-visible:ring-2 focus-visible:ring-indigo-500",
    "focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.98]",
    "[&_svg]:size-4",
    "[&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-indigo-600 text-white",
          "shadow-sm shadow-indigo-600/25",
          "hover:bg-indigo-700",
          "hover:shadow-md hover:shadow-indigo-600/20",
        ].join(" "),

        teal: [
          "bg-teal-600 text-white",
          "shadow-sm shadow-teal-600/25",
          "hover:bg-teal-700",
          "hover:shadow-md hover:shadow-teal-600/20",
        ].join(" "),

        outline: [
          "border border-slate-200",
          "bg-white text-slate-800",
          "shadow-sm shadow-slate-900/5",
          "hover:border-slate-300",
          "hover:bg-slate-50",
          "hover:shadow-md hover:shadow-slate-900/5",
        ].join(" "),

        ghost: [
          "text-slate-700",
          "hover:bg-slate-100",
          "hover:text-slate-950",
        ].join(" "),

        secondary: [
          "bg-slate-100 text-slate-900",
          "shadow-sm shadow-slate-900/5",
          "hover:bg-slate-200",
        ].join(" "),

        dark: [
          "bg-[#1E1B4B] text-white",
          "shadow-sm shadow-indigo-950/20",
          "hover:bg-[#2a2670]",
          "hover:shadow-md hover:shadow-indigo-950/20",
        ].join(" "),
      },

      size: {
        default: "h-10 px-4",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-9 w-9",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : type}
        className={cn(
          buttonVariants({
            variant,
            size,
            className,
          }),
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";