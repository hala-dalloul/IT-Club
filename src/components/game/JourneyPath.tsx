import { Check, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

interface JourneyPathProps {
  /** 1-based current stage */
  current: number;
  total: number;
}

/**
 * Futuristic journey path with checkpoints instead of a plain progress bar.
 * Flows right-to-left (RTL) with the student's rocket marker moving along it.
 */
export function JourneyPath({ current, total }: JourneyPathProps) {
  const fillPercent = total <= 1 ? 100 : ((current - 1) / (total - 1)) * 100;

  return (
    <div className="w-full" role="progressbar" aria-valuenow={current} aria-valuemin={1} aria-valuemax={total} aria-label={`المرحلة ${current} من ${total}`}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-extrabold text-primary">
          المرحلة {current} من {total}
        </span>
        <span className="text-xs font-bold text-muted-foreground">رحلة اكتشاف المسار 🗺️</span>
      </div>

      <div className="relative px-1 pb-7 pt-1">
        {/* Track */}
        <div className="absolute inset-x-1 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-muted" />
        {/* Fill — anchored to the right for RTL flow */}
        <div
          className="animate-dash-flow absolute right-1 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-brand-gradient transition-[width] duration-500 ease-out [background-size:44px_100%]"
          style={{ width: `calc(${fillPercent}% )` }}
        />

        <ol className="relative flex items-center justify-between">
          {Array.from({ length: total }, (_, i) => {
            const stage = i + 1;
            const done = stage < current;
            const active = stage === current;
            return (
              <li key={stage} className="relative grid place-items-center">
                <span
                  className={cn(
                    "grid h-7 w-7 place-items-center rounded-full border-2 text-[11px] font-black transition-all duration-300 sm:h-8 sm:w-8",
                    done && "border-accent bg-accent text-accent-foreground",
                    active && "animate-glow-pulse scale-125 border-primary bg-primary text-primary-foreground",
                    !done && !active && "border-border bg-card text-muted-foreground",
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" strokeWidth={3.5} /> : stage}
                </span>
                {active && (
                  <span className="animate-float-slow absolute -top-7 text-primary" aria-hidden="true">
                    <Rocket className="h-5 w-5 -rotate-45" />
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
