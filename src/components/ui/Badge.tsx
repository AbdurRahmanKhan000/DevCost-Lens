import React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "cyan" | "emerald" | "amber" | "purple";
  className?: string;
  children?: React.ReactNode;
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    secondary: "bg-zinc-800 text-zinc-300 border-zinc-700/50",
    destructive: "bg-red-500/15 text-red-400 border-red-500/30",
    outline: "text-zinc-300 border-zinc-700 bg-transparent",
    cyan: "bg-cyan-950/60 text-cyan-300 border-cyan-800/60 shadow-[0_0_12px_rgba(6,182,212,0.15)]",
    emerald: "bg-emerald-950/60 text-emerald-300 border-emerald-800/60 shadow-[0_0_12px_rgba(16,185,129,0.15)]",
    amber: "bg-amber-950/60 text-amber-300 border-amber-800/60",
    purple: "bg-purple-950/60 text-purple-300 border-purple-800/60",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors uppercase font-mono",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
