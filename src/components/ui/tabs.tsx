"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      [
        "inline-flex",
        "items-center",
        "gap-1",
        "rounded-xl",
        "border border-slate-200/80",
        "bg-slate-50",
        "p-1",
        "shadow-sm shadow-slate-900/[0.03]",
      ].join(" "),
      className,
    )}
    {...props}
  />
));

TabsList.displayName = "TabsList";

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      [
        "inline-flex",
        "cursor-pointer",
        "items-center",
        "justify-center",
        "gap-2",
        "rounded-lg",
        "px-3.5",
        "py-2",
        "text-sm",
        "font-semibold",
        "leading-none",
        "text-slate-500",
        "transition-all",
        "duration-200",
        "ease-out",
        "hover:bg-white/70",
        "hover:text-slate-800",
        "focus-visible:outline-none",
        "focus-visible:ring-2",
        "focus-visible:ring-indigo-500/25",
        "focus-visible:ring-offset-1",
        "data-[state=active]:bg-white",
        "data-[state=active]:text-indigo-700",
        "data-[state=active]:shadow-sm",
        "data-[state=active]:shadow-slate-900/[0.06]",
        "disabled:pointer-events-none",
        "disabled:opacity-50",
        "[&_svg]:size-4",
        "[&_svg]:shrink-0",
      ].join(" "),
      className,
    )}
    {...props}
  />
));

TabsTrigger.displayName = "TabsTrigger";

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      [
        "mt-5",
        "rounded-xl",
        "focus-visible:outline-none",
        "focus-visible:ring-2",
        "focus-visible:ring-indigo-500/20",
        "focus-visible:ring-offset-2",
      ].join(" "),
      className,
    )}
    {...props}
  />
));

TabsContent.displayName = "TabsContent";