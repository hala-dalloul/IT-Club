import { ArrowRight, Compass, ListChecks, Rocket, Smile, Info, Heart } from "lucide-react";
import logo from "@/assets/ucas-logo.png";
import { BrandButton } from "./BrandButton";

interface InfoScreenProps {
  onBack: () => void;
  onStart: () => void;
}

const STEPS = [
  { icon: Smile, title: "اختار شخصيتك", desc: "خمس شخصيات — اختار الأقرب إلك. اختيارك بيأثر شوي، بس مش هو اللي بيحدد النتيجة." },
  { icon: ListChecks, title: "جاوب على 7 مواقف", desc: "مش أسئلة مدرسية مملة — مواقف وسيناريوهات من الحياة التقنية الحقيقية." },
  { icon: Compass, title: "نحلل اختياراتك", desc: "خوارزمية بسيطة بتحسب ميولك تجاه كل مسار من المسارات الخمسة." },
  { icon: Rocket, title: "نكشف مسارك", desc: "نتيجة شخصية توضح ليش هذا المسار قريب منك، وشو ممكن تعمل فيه مستقبلاً." },
];

export function HowItWorksScreen({ onBack, onStart }: InfoScreenProps) {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
      <div className="text-center">
        <p className="text-sm font-bold text-muted-foreground">كل شيء بأربع خطوات ⚡</p>
        <h2 className="mt-2 text-3xl font-black text-foreground sm:text-5xl">
          كيف تعمل <span className="text-gradient-brand">اللعبة؟</span>
        </h2>
      </div>

      <ol className="mt-12 grid gap-4 sm:grid-cols-2">
        {STEPS.map((step, i) => (
          <li
            key={step.title}
            className="animate-stage-in relative rounded-3xl border border-border bg-card p-6 shadow-card"
            style={{ animationDelay: `${i * 90}ms` }}
          >
            <span className="absolute top-5 left-5 text-4xl font-black text-primary/10">{i + 1}</span>
            <span className="grid h-13 w-13 place-items-center rounded-2xl bg-brand-gradient-soft text-primary">
              <step.icon className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-lg font-extrabold text-foreground">{step.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
          </li>
        ))}
      </ol>

      <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <BrandButton size="lg" onClick={onStart}>
          <Rocket className="h-5 w-5" />
          ابدأ الرحلة 🚀
        </BrandButton>
        <BrandButton variant="ghost" onClick={onBack}>
          <ArrowRight className="h-4 w-4" />
          رجوع
        </BrandButton>
      </div>
    </section>
  );
}

export function AboutClubScreen({ onBack }: { onBack: () => void }) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <div className="animate-stage-in rounded-[2rem] border border-border bg-card p-8 text-center shadow-card sm:p-12">
        <img style={{ objectFit: "contain" }} src={logo} alt="شعار UCAS IT CLUB" width={512} height={512} className="animate-float-slow mx-auto h-28 w-28" />
        <h2 className="mt-6 text-3xl font-black text-foreground sm:text-4xl">UCAS IT CLUB</h2>
        <p className="mt-1 text-sm font-bold text-primary">نادي تكنولوجيا المعلومات — الكلية الجامعية للعلوم التطبيقية</p>

        <p className="mx-auto mt-6 max-w-xl text-sm leading-loose text-muted-foreground sm:text-base">
          احنا مجتمع طلابي بيحب التقنية وبيعيشها — من التصميم والويب، للألعاب والتطبيقات والأنظمة.
          هدفنا نساعد الطلاب الجدد يلاقوا شغفهم، يتعلموا مهارات حقيقية، ويبنوا مشاريع بيفتخروا فيها.
          لعبة "اكتشف مسارك" طوّرناها خصيصاً لطلاب السنة الأولى اللي محتارين أي تخصص يختاروا.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {["فعاليات تقنية", "ورشات عمل", "مشاريع طلابية", "مجتمع داعم"].map((tag) => (
            <span key={tag} className="rounded-full bg-brand-gradient-soft px-4 py-1.5 text-xs font-bold text-primary">
              {tag}
            </span>
          ))}
        </div>

        <p className="mt-8 flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground">
          صُنع بـ <Heart className="h-3.5 w-3.5 text-accent" /> من فريق UCAS IT CLUB
        </p>
      </div>

      <div className="mt-8 text-center">
        <BrandButton variant="ghost" onClick={onBack}>
          <ArrowRight className="h-4 w-4" />
          رجوع
        </BrandButton>
      </div>
    </section>
  );
}
