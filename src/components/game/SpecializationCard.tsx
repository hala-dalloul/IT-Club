import { Briefcase, Sparkles, Users } from "lucide-react";
import type { Specialization } from "@/lib/game-data";
import { cn } from "@/lib/utils";

interface SpecializationCardProps {
  spec: Specialization;
  /** Optional rank badge (1 or 2) shown on results */
  rank?: number | undefined;
  className?: string;
  style?: React.CSSProperties;
}

export function SpecializationCard({ spec, rank, className, style }: SpecializationCardProps) {
  const Icon = spec.icon;
  return (
    <article
      className={cn(
        "animate-stage-in relative overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-card sm:p-8",
        className,
      )}
      style={style}
    >
      <div className="pointer-events-none absolute -top-20 -left-20 h-48 w-48 rounded-full bg-brand-gradient opacity-10 blur-3xl" aria-hidden="true" />

      {rank !== undefined && (
        <span className="absolute top-5 left-5 rounded-full bg-brand-gradient px-3 py-1 text-xs font-black text-primary-foreground shadow-glow-blue">
          المسار {rank === 1 ? "الأقرب 🏆" : "الثاني ✨"}
        </span>
      )}

      <div className="flex items-center gap-4">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-brand-gradient text-primary-foreground shadow-glow-blue sm:h-20 sm:w-20">
          <Icon className="h-8 w-8 sm:h-10 sm:w-10" />
        </span>
        <div className="min-w-0">
          <h3 className="text-xl font-black text-foreground sm:text-2xl">{spec.title}</h3>
          <p className="mt-1 text-sm font-bold text-primary sm:text-base">{spec.name}</p>
          <p className="text-[11px] font-semibold tracking-wide text-muted-foreground">{spec.nameEn}</p>
        </div>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-muted-foreground sm:text-base">{spec.description}</p>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {spec.keywords.map((keyword) => (
          <span key={keyword} className="rounded-full bg-brand-gradient-soft px-3 py-1 text-xs font-bold text-primary">
            {keyword}
          </span>
        ))}
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <h4 className="flex items-center gap-1.5 text-sm font-extrabold text-foreground">
            <Sparkles className="h-4 w-4 text-accent" />
            شو رح تتعلم؟
          </h4>
          <ul className="mt-2 space-y-1.5">
            {spec.topics.map((topic) => (
              <li key={topic} className="flex items-center gap-2 text-xs font-semibold text-muted-foreground sm:text-sm" dir="ltr">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {topic}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="flex items-center gap-1.5 text-sm font-extrabold text-foreground">
            <Briefcase className="h-4 w-4 text-accent" />
            شو ممكن تعمل بعده؟
          </h4>
          <ul className="mt-2 space-y-1.5">
            {spec.careers.map((career) => (
              <li key={career} className="flex items-center gap-2 text-xs font-semibold text-muted-foreground sm:text-sm" dir="ltr">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {career}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-accent/25 bg-accent/5 p-4">
        <h4 className="flex items-center gap-1.5 text-sm font-extrabold text-foreground">
          <Users className="h-4 w-4 text-accent" />
          مين بناسبه؟
        </h4>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">{spec.fitFor}</p>
      </div>
    </article>
  );
}
