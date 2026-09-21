import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import "./hero-section-4.css";

interface HeroSectionProps extends HTMLAttributes<HTMLElement> {
  imageUrl: string;
}

/** Adds the supplied hero effect without replacing the existing page content. */
export const HeroSection = forwardRef<HTMLElement, HeroSectionProps>(
  ({ imageUrl, children, className, ...props }, ref) => (
    <section ref={ref} className={cn("club-image-hero", className)} {...props}>
      <div
        className="club-image-hero-art"
        style={{ backgroundImage: `url(${imageUrl})` }}
        aria-hidden="true"
      />
      <div className="club-image-hero-shade" aria-hidden="true" />
      <div className="club-image-hero-content">{children}</div>
    </section>
  ),
);
HeroSection.displayName = "HeroSection";
