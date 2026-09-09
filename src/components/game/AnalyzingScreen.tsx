import { useEffect, useState } from "react";
import logo from "@/assets/ucas-logo.png";

const PHRASES = ["نحلل اختياراتك...", "نقارن شخصيتك بالمسارات الخمسة...", "نجهز نتيجتك..."];

interface AnalyzingScreenProps {
  onDone: () => void;
}

export function AnalyzingScreen({ onDone }: AnalyzingScreenProps) {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const phraseTimer = window.setInterval(() => {
      setPhraseIndex((i) => Math.min(i + 1, PHRASES.length - 1));
    }, 700);
    const doneTimer = window.setTimeout(onDone, 2200);
    return () => {
      window.clearInterval(phraseTimer);
      window.clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <section
      className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center"
      aria-live="polite"
      aria-busy="true"
    >
      <p className="text-2xl font-black text-foreground sm:text-3xl">لحظة...</p>

      <div className="relative mt-12 grid h-40 w-40 place-items-center">
        <span className="absolute inset-0 rounded-full border-2 border-dashed border-primary/25" aria-hidden="true" />
        <span className="animate-orbit absolute left-1/2 top-1/2 h-4 w-4 rounded-full bg-accent shadow-glow-green" aria-hidden="true" />
        <span
          className="animate-orbit absolute left-1/2 top-1/2 h-3 w-3 rounded-full bg-primary shadow-glow-blue"
          style={{ animationDelay: "-0.8s", animationDuration: "2.2s" }}
          aria-hidden="true"
        />
        <img style={{ objectFit: "contain" }} src={logo} alt="" width={96} height={96} className="animate-float-slow h-24 w-24" />
      </div>

      <p key={phraseIndex} className="animate-stage-in mt-12 text-lg font-bold text-primary">
        {PHRASES[phraseIndex]} 👀
      </p>

      <div className="mt-6 h-1.5 w-48 overflow-hidden rounded-full bg-muted">
        <div className="animate-shimmer h-full w-full bg-brand-gradient" />
      </div>
    </section>
  );
}
