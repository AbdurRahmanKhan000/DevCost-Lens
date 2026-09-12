import React from "react";
import { cn } from "../../lib/utils";

interface ComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
  key?: React.Key;
}

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string;
  children?: React.ReactNode;
}

interface ParagraphProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
  children?: React.ReactNode;
}

export function Card({ className, children, ...props }: ComponentProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-xl text-zinc-100 shadow-xl transition-all duration-300 hover:border-zinc-700/80",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: ComponentProps) {
  return (
    <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: HeadingProps) {
  return (
    <h3
      className={cn("text-xl font-bold tracking-tight text-white", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: ParagraphProps) {
  return (
    <p
      className={cn("text-sm text-zinc-400 leading-relaxed", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }: ComponentProps) {
  return (
    <div className={cn("p-6 pt-0", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: ComponentProps) {
  return (
    <div
      className={cn(
        "flex items-center p-6 pt-0 border-t border-zinc-800/50 mt-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
