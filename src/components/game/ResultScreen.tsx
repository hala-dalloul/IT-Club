import { Compass, RotateCcw, Sparkles } from "lucide-react";
import type { GameResult } from "@/lib/scoring";
import { BrandButton } from "./BrandButton";
import { ConfettiCanvas } from "./ConfettiCanvas";
import { SpecializationCard } from "./SpecializationCard";

interface ResultScreenProps {
  result: GameResult;
  onRestart: () => void;
  onExplore: () => void;
}

export function ResultScreen({ result, onRestart, onExplore }: ResultScreenProps) {
  const { top, second, closeMatch } = result;

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
      <ConfettiCanvas />

      <div className="text-center">
        <p className="animate-pop-in inline-flex items-center gap-2 rounded-full bg-brand-gradient px-5 py-2 text-base font-black text-primary-foreground shadow-glow-blue sm:text-lg">
          <Sparkles className="h-5 w-5" />
          اكتشفنا مسارك! 🚀
        </p>
        <h2 className="animate-stage-in mt-6 text-2xl font-extrabold text-muted-foreground sm:text-3xl" style={{ animationDelay: "150ms" }}>
          {closeMatch ? "عندك أكثر من مسار مناسب لك!" : "أنت أقرب إلى..."}
        </h2>
      </div>

      <div className={closeMatch ? "mt-10 grid gap-6 lg:grid-cols-2" : "mt-10"}>
        <SpecializationCard spec={top} rank={closeMatch ? 1 : undefined} style={{ animationDelay: "250ms" }} />
        {closeMatch && second && <SpecializationCard spec={second} rank={2} style={{ animationDelay: "400ms" }} />}
      </div>

      <div className="animate-stage-in mt-8 rounded-[2rem] bg-brand-gradient-soft p-6 sm:p-8" style={{ animationDelay: "500ms" }}>
        <h3 className="text-lg font-black text-foreground sm:text-xl">ليش هذا المسار؟ 🤔</h3>
        <p className="mt-2 text-sm leading-relaxed text-foreground/80 sm:text-base">{top.whyText}</p>

        <h4 className="mt-5 text-sm font-extrabold text-foreground sm:text-base">نقاط قوتك 💪</h4>
        <div className="mt-2 flex flex-wrap gap-2">
          {top.strengths.map((strength) => (
            <span key={strength} className="rounded-full border border-primary/25 bg-card px-4 py-1.5 text-sm font-bold text-primary shadow-card">
              {strength}
            </span>
          ))}
        </div>
      </div>

      <p className="animate-stage-in mt-6 text-center text-xs leading-relaxed text-muted-foreground" style={{ animationDelay: "600ms" }}>
        هذه النتيجة استرشادية لمساعدتك على اكتشاف اهتماماتك، وليست بديلاً عن الإرشاد الأكاديمي.
      </p>

      <div className="animate-stage-in mt-10 text-center" style={{ animationDelay: "700ms" }}>
        <p className="text-xl font-extrabold text-foreground sm:text-2xl">مش مقتنع؟ 👀</p>
        <p className="mt-1 text-sm font-bold text-muted-foreground">ولا يهمك، شوف كل المسارات</p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <BrandButton size="lg" onClick={onExplore}>
            <Compass className="h-5 w-5" />
            استكشف التخصصات الخمسة
          </BrandButton>
          <BrandButton size="lg" variant="outline" onClick={onRestart}>
            <RotateCcw className="h-5 w-5" />
            أعيد الاختبار
          </BrandButton>
        </div>
      </div>
    </section>
  );
}
