import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        [
          "rounded-2xl",
          "border border-slate-200/80",
          "bg-white",
          "shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)]",
          "transition-shadow duration-200",
          "hover:shadow-[0_2px_4px_rgba(15,23,42,0.05),0_12px_30px_-14px_rgba(15,23,42,0.16)]",
        ].join(" "),
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        [
          "flex flex-col",
          "gap-1.5",
          "p-6 pb-3",
        ].join(" "),
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        [
          "text-lg font-semibold",
          "leading-tight",
          "tracking-tight",
          "text-slate-900",
        ].join(" "),
        className,
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        [
          "text-sm",
          "leading-relaxed",
          "text-slate-500",
        ].join(" "),
        className,
      )}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "p-6 pt-3",
        className,
      )}
      {...props}
    />
  );
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        [
          "flex items-center",
          "gap-3",
          "p-6 pt-0",
        ].join(" "),
        className,
      )}
      {...props}
    />
  );
}