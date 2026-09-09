import { ArrowRight, ExternalLink, RotateCcw } from "lucide-react";
import { SPECIALIZATIONS } from "@/lib/game-data";
import { BrandButton } from "./BrandButton";
import { SpecializationCard } from "./SpecializationCard";

interface ExploreScreenProps {
  onRestart: () => void;
  onBack: () => void;
}

export function ExploreScreen({ onRestart, onBack }: ExploreScreenProps) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <div className="text-center">
        <p className="text-sm font-bold text-muted-foreground">خريطة المسارات 🗺️</p>
        <h2 className="mt-2 text-3xl font-black text-foreground sm:text-5xl">
          استكشف <span className="text-gradient-brand">التخصصات الخمسة</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          كل مسار له عالمه الخاص — ما في مسار "أفضل" من غيره. المهم تلاقي الطريق اللي يشبهك أنت.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {SPECIALIZATIONS.map((spec, i) => (
          <SpecializationCard key={spec.id} spec={spec} style={{ animationDelay: `${i * 100}ms` }} />
        ))}
      </div>

      <div className="animate-stage-in mt-16 overflow-hidden rounded-[2rem] border border-primary/15 bg-brand-gradient-soft p-8 text-center sm:p-12">
        <h3 className="text-2xl font-black text-foreground sm:text-4xl">جاهز تبدأ طريقك؟ 🚀</h3>
        <p className="mx-auto mt-3 max-w-lg text-sm font-semibold leading-relaxed text-muted-foreground sm:text-base">
          اختيار التخصص خطوة مهمة...
          <br />
          بس أهم شيء تختار الطريق اللي يشبهك.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <BrandButton size="lg" onClick={onRestart}>
            <RotateCcw className="h-5 w-5" />
            أعيد الاختبار
          </BrandButton>
          <a
            href="https://www.ucas.edu.ps"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary/30 bg-card px-9 py-4 text-lg font-bold text-primary transition-all duration-200 hover:border-primary/60 hover:bg-primary/5 active:scale-[0.97]"
          >
            <ExternalLink className="h-5 w-5" />
            تواصل مع UCAS IT CLUB
          </a>
        </div>
      </div>

      <div className="mt-10 text-center">
        <BrandButton variant="ghost" onClick={onBack}>
          <ArrowRight className="h-4 w-4" />
          رجوع للرئيسية
        </BrandButton>
      </div>
    </section>
  );
}
