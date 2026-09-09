import { Check, ArrowRight, ArrowLeft } from "lucide-react";
import { CHARACTERS, type SpecId } from "@/lib/game-data";
import { cn } from "@/lib/utils";
import { BrandButton } from "./BrandButton";

interface CharacterScreenProps {
  selected: SpecId | null;
  onSelect: (id: SpecId) => void;
  onNext: () => void;
  onBack: () => void;
}

export function CharacterScreen({ selected, onSelect, onNext, onBack }: CharacterScreenProps) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
      <div className="text-center">
        <p className="text-sm font-bold text-muted-foreground">قبل ما نبدأ...</p>
        <h2 className="mt-2 text-3xl font-black text-foreground sm:text-4xl">اختار الشخصية الأقرب إلك 👇</h2>
        <p className="mt-3 text-sm text-muted-foreground">مش شرط تكون متأكد — بس اختار اللي بتحسه يشبهك أكثر</p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        {CHARACTERS.map((character, i) => {
          const isSelected = selected === character.id;
          const Icon = character.icon;
          return (
            <button
              key={character.id}
              type="button"
              onClick={() => onSelect(character.id)}
              aria-pressed={isSelected}
              className={cn(
                "animate-stage-in group relative flex flex-col items-center gap-2 rounded-3xl border-2 bg-card p-5 text-center transition-all duration-200 sm:p-6",
                isSelected
                  ? "border-primary shadow-glow-blue -translate-y-1"
                  : "border-border shadow-card hover:-translate-y-1 hover:border-primary/40",
              )}
              style={{ animationDelay: `${i * 70}ms` }}
            >
              {isSelected && (
                <span className="animate-pop-in absolute -top-2.5 -left-2.5 grid h-7 w-7 place-items-center rounded-full bg-accent text-accent-foreground shadow-glow-green">
                  <Check className="h-4 w-4" strokeWidth={3} />
                </span>
              )}
              <span
                className={cn(
                  "grid h-16 w-16 place-items-center rounded-2xl transition-all duration-200",
                  isSelected
                    ? "bg-brand-gradient text-primary-foreground shadow-glow-blue"
                    : "bg-brand-gradient-soft text-primary group-hover:scale-105",
                )}
              >
                <Icon className="h-8 w-8" />
              </span>
              <span className="text-base font-extrabold text-foreground sm:text-lg">
                {character.label} {character.emoji}
              </span>
              <span className="text-xs leading-relaxed text-muted-foreground">{character.desc}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-12 flex items-center justify-between gap-3">
        <BrandButton variant="ghost" onClick={onBack}>
          <ArrowRight className="h-4 w-4" />
          رجوع
        </BrandButton>
        <BrandButton size="lg" onClick={onNext} disabled={!selected}>
          يلا نبدأ الأسئلة
          <ArrowLeft className="h-5 w-5" />
        </BrandButton>
      </div>
      {!selected && <p className="mt-3 text-center text-xs font-semibold text-muted-foreground">اختار شخصية عشان نكمل 👆</p>}
    </section>
  );
}
