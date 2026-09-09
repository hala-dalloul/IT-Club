import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "accent" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand-gradient text-primary-foreground shadow-glow-blue hover:brightness-110 hover:shadow-glow-green active:scale-[0.97]",
  accent: "bg-accent text-accent-foreground shadow-glow-green hover:brightness-105 active:scale-[0.97]",
  outline:
    "border-2 border-primary/30 bg-card text-primary hover:border-primary/60 hover:bg-primary/5 active:scale-[0.97]",
  ghost: "text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.97]",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-sm rounded-full gap-1.5",
  md: "px-6 py-3 text-base rounded-full gap-2",
  lg: "px-9 py-4 text-lg rounded-full gap-2.5",
};

interface BrandButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function BrandButton({ variant = "primary", size = "md", className, ...props }: BrandButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-bold transition-all duration-200 disabled:pointer-events-none disabled:opacity-40",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
