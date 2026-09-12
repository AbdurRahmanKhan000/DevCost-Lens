import React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "glow" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer";

    const variants = {
      default:
        "bg-gradient-to-r from-cyan-500 to-teal-500 text-zinc-950 font-semibold shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-teal-400 active:scale-[0.98]",
      glow:
        "bg-zinc-900 text-cyan-300 border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:border-cyan-400 active:scale-[0.98]",
      secondary:
        "bg-zinc-800/80 text-zinc-100 hover:bg-zinc-700/80 border border-zinc-700/50 active:scale-[0.98]",
      outline:
        "border border-zinc-700/80 bg-zinc-900/50 text-zinc-200 hover:bg-zinc-800/80 hover:text-white hover:border-zinc-500 active:scale-[0.98]",
      ghost:
        "hover:bg-zinc-800/60 text-zinc-300 hover:text-white",
      link:
        "text-cyan-400 underline-offset-4 hover:underline p-0 h-auto",
      destructive:
        "bg-red-600/90 text-white hover:bg-red-500 active:scale-[0.98]",
    };

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-12 rounded-xl px-6 text-base",
      icon: "h-10 w-10 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Please wait...</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = "Button";
