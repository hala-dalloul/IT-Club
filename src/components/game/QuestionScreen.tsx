import { ArrowRight, ArrowLeft, Check, Flag } from "lucide-react";
import type { Question } from "@/lib/game-data";
import { cn } from "@/lib/utils";
import { BrandButton } from "./BrandButton";
import { JourneyPath } from "./JourneyPath";

interface QuestionScreenProps {
  question: Question;
  index: number;
  total: number;
  selected: number | null;
  onSelect: (optionIndex: number) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function QuestionScreen({ question, index, total, selected, onSelect, onNext, onPrev }: QuestionScreenProps) {
  const isLast = index === total - 1;

  return (
    <section className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <JourneyPath current={index + 1} total={total} />

      <div key={question.id} className="animate-stage-in mt-8">
        <p className="text-center text-sm font-bold text-muted-foreground">{question.vibe}</p>
        <h2 className="mt-3 text-center text-2xl font-black leading-snug text-foreground sm:text-3xl">
          {question.scenario}
        </h2>

        <div
          className={cn(
            "mt-9 gap-3 sm:gap-4",
            question.layout === "grid" ? "grid sm:grid-cols-2" : "flex flex-col",
          )}
        >
          {question.options.map((option, i) => {
            const isSelected = selected === i;
            const Icon = option.icon;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onSelect(i)}
                aria-pressed={isSelected}
                className={cn(
                  "animate-stage-in group relative flex items-center gap-4 rounded-3xl border-2 bg-card p-4 text-right transition-all duration-200 sm:p-5",
                  question.layout === "grid" && question.options.length % 2 === 1 && i === question.options.length - 1
                    ? "sm:col-span-2"
                    : "",
                  isSelected
                    ? "border-primary shadow-glow-blue -translate-y-0.5 bg-primary/5"
                    : "border-border shadow-card hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow-blue",
                )}
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <span
                  className={cn(
                    "grid h-13 w-13 shrink-0 place-items-center rounded-2xl transition-all duration-200 sm:h-14 sm:w-14",
                    isSelected
                      ? "bg-brand-gradient text-primary-foreground shadow-glow-blue"
                      : "bg-brand-gradient-soft text-primary group-hover:scale-105",
                  )}
                >
                  <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-extrabold text-foreground sm:text-lg">{option.text}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground sm:text-sm">{option.desc}</span>
                </span>
                <span
                  className={cn(
                    "grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-all duration-200",
                    isSelected ? "border-accent bg-accent text-accent-foreground" : "border-border bg-card text-transparent",
                  )}
                  aria-hidden="true"
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={3.5} />
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-10 flex items-center justify-between gap-3">
          <BrandButton variant="ghost" onClick={onPrev}>
            <ArrowRight className="h-4 w-4" />
            السابق
          </BrandButton>
          <BrandButton size="lg" onClick={onNext} disabled={selected === null}>
            {isLast ? (
              <>
                اكشف مساري!
                <Flag className="h-5 w-5" />
              </>
            ) : (
              <>
                التالي
                <ArrowLeft className="h-5 w-5" />
              </>
            )}
          </BrandButton>
        </div>
      </div>
    </section>
  );
}
