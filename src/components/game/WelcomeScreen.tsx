import { Rocket, Gamepad2, Globe, Palette, Smartphone, BrainCircuit } from "lucide-react";
import logo from "@/assets/ucas-logo.png";
import { BrandButton } from "./BrandButton";

interface WelcomeScreenProps {
  onStart: () => void;
}

const floatingIcons = [
  { Icon: Palette, className: "top-[18%] right-[10%] text-primary/30 hidden sm:block", delay: "0s" },
  { Icon: Globe, className: "top-[30%] left-[8%] text-accent/40 hidden sm:block", delay: "-2s" },
  { Icon: Gamepad2, className: "bottom-[28%] right-[14%] text-accent/35 hidden sm:block", delay: "-4s" },
  { Icon: Smartphone, className: "bottom-[20%] left-[12%] text-primary/30 hidden sm:block", delay: "-1s" },
  { Icon: BrainCircuit, className: "top-[55%] right-[5%] hidden lg:block text-primary/25", delay: "-3s" },
];

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <section className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl flex-col items-center justify-center px-4 py-16 text-center">
      {floatingIcons.map(({ Icon, className, delay }, i) => (
        <Icon
          key={i}
          aria-hidden="true"
          className={`animate-float-slow absolute h-12 w-12 ${className}`}
          style={{ animationDelay: delay }}
        />
      ))}

      <div className="animate-pop-in">
        <img
          src={logo} style={{ objectFit: "contain" }}
          alt="شعار نادي تكنولوجيا المعلومات — UCAS IT CLUB"
          width={512}
          height={512}
          className="animate-float-slow mx-auto h-32 w-32 drop-shadow-xl sm:h-40 sm:w-40"
        />
      </div>

      <p className="animate-stage-in mt-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold text-primary sm:text-sm" style={{ animationDelay: "80ms" }}>
        نادي تكنولوجيا المعلومات — يوكاس | UCAS IT CLUB
      </p>

      <h1 className="animate-stage-in mt-5 text-5xl font-black leading-tight tracking-tight sm:text-7xl" style={{ animationDelay: "160ms" }}>
        <span className="text-gradient-brand">اكتشف مسارك</span>
      </h1>

      <p className="animate-stage-in mt-3 text-lg font-bold text-muted-foreground sm:text-2xl" style={{ animationDelay: "240ms" }}>
        رحلتك التقنية تبدأ من هنا
      </p>

      <div className="animate-stage-in mt-10 space-y-2" style={{ animationDelay: "320ms" }}>
        <p className="text-2xl font-extrabold text-foreground sm:text-3xl">مش عارف أي تخصص يناسبك؟ 👀</p>
        <p className="text-xl font-bold text-muted-foreground sm:text-2xl">
          ولا يهمك...
          <br />
          خلينا نكتشف مسارك مع بعض!
        </p>
      </div>

      <div className="animate-stage-in mt-10" style={{ animationDelay: "400ms" }}>
        <BrandButton size="lg" onClick={onStart} className="text-xl">
          <Rocket className="h-6 w-6" />
          ابدأ الرحلة 🚀
        </BrandButton>
      </div>

      <p className="animate-stage-in mt-8 max-w-md text-sm leading-relaxed text-muted-foreground" style={{ animationDelay: "480ms" }}>
        جاوب على مجموعة أسئلة ممتعة، واكتشف المجال التقني الأقرب لشخصيتك واهتماماتك.
      </p>
    </section>
  );
}
