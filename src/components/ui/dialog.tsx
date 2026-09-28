"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      {/* Backdrop */}
      <DialogPrimitive.Overlay
        className={cn(
          "fixed inset-0 z-50",
          "bg-slate-950/45",
          "backdrop-blur-[3px]",
          "data-[state=open]:animate-[fadeIn_200ms_ease-out]",
          "data-[state=closed]:animate-[fadeOut_150ms_ease-in]",
        )}
      />

      {/* Dialog */}
      <DialogPrimitive.Content
        className={cn(
          [
            "fixed left-1/2 top-1/2 z-50",
            "w-[calc(100%-2rem)]",
            "max-w-lg",
            "max-h-[90vh]",
            "-translate-x-1/2 -translate-y-1/2",
            "overflow-y-auto",
            "rounded-2xl",
            "border border-slate-200/80",
            "bg-white",
            "p-6",
            "shadow-[0_24px_70px_-20px_rgba(15,23,42,0.35)]",
            "outline-none",
            "data-[state=open]:animate-[popIn_200ms_ease-out]",
            "data-[state=closed]:animate-[popOut_150ms_ease-in]",
            "sm:w-[calc(100%-3rem)]",
          ].join(" "),
          className,
        )}
        {...props}
      >
        {children}

        {/* Close button */}
        <DialogPrimitive.Close
          className={cn(
            [
              "absolute right-4 top-4",
              "inline-flex h-8 w-8",
              "items-center justify-center",
              "rounded-lg",
              "text-slate-400",
              "transition-all duration-200",
              "hover:bg-slate-100",
              "hover:text-slate-700",
              "active:scale-95",
              "cursor-pointer",
              "focus-visible:outline-none",
              "focus-visible:ring-2",
              "focus-visible:ring-indigo-500",
              "focus-visible:ring-offset-2",
              "disabled:pointer-events-none",
            ].join(" "),
          )}
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export const DialogTitle = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) => (
  <DialogPrimitive.Title
    className={cn(
      [
        "text-lg",
        "font-semibold",
        "leading-tight",
        "tracking-tight",
        "text-slate-900",
        "pr-8",
      ].join(" "),
      className,
    )}
    {...props}
  />
);

export const DialogDescription = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) => (
  <DialogPrimitive.Description
    className={cn(
      [
        "mt-1.5",
        "text-sm",
        "leading-relaxed",
        "text-slate-500",
        "pr-6",
      ].join(" "),
      className,
    )}
    {...props}
  />
);