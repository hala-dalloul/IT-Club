import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { QUESTIONS, type SpecId } from "@/lib/game-data";
import { computeResult } from "@/lib/scoring";
import { AnalyzingScreen } from "@/components/game/AnalyzingScreen";
import { CharacterScreen } from "@/components/game/CharacterScreen";
import { ExploreScreen } from "@/components/game/ExploreScreen";
import { FloatingBackground } from "@/components/game/FloatingBackground";
import { AboutClubScreen, HowItWorksScreen } from "@/components/game/InfoScreens";
import { Navbar } from "@/components/game/Navbar";
import { QuestionScreen } from "@/components/game/QuestionScreen";
import { ResultScreen } from "@/components/game/ResultScreen";
import { WelcomeScreen } from "@/components/game/WelcomeScreen";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "اكتشف مسارك | UCAS IT CLUB" },
      {
        name: "description",
        content:
          "لعبة تفاعلية من نادي تكنولوجيا المعلومات في UCAS تساعد الطلاب الجدد على اكتشاف التخصص التقني الأقرب لشخصيتهم واهتماماتهم عبر رحلة ممتعة من المواقف والأسئلة.",
      },
      { property: "og:title", content: "اكتشف مسارك — رحلتك التقنية تبدأ من هنا" },
      {
        property: "og:description",
        content: "مش عارف أي تخصص يناسبك؟ ولا يهمك — جاوب على أسئلة ممتعة واكتشف المجال التقني الأقرب لشخصيتك مع UCAS IT CLUB.",
      },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "ar_PS" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Stage = "welcome" | "character" | "questions" | "analyzing" | "result" | "explore" | "how" | "about";

function Index() {
  const [stage, setStage] = useState<Stage>("welcome");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => QUESTIONS.map(() => null));
  const [character, setCharacter] = useState<SpecId | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [stage, questionIndex]);

  const result = useMemo(
    () => (stage === "result" || stage === "analyzing" ? computeResult(answers, character) : null),
    [stage, answers, character],
  );

  const startJourney = () => setStage("character");
  const goHome = () => setStage("welcome");

  const restart = () => {
    setAnswers(QUESTIONS.map(() => null));
    setCharacter(null);
    setQuestionIndex(0);
    setStage("character");
  };

  const selectAnswer = (optionIndex: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[questionIndex] = optionIndex;
      return next;
    });
  };

  const nextQuestion = () => {
    if (questionIndex === QUESTIONS.length - 1) {
      setStage("analyzing");
    } else {
      setQuestionIndex((i) => i + 1);
    }
  };

  const prevQuestion = () => {
    if (questionIndex === 0) {
      setStage("character");
    } else {
      setQuestionIndex((i) => i - 1);
    }
  };

  const isGameStage = stage === "character" || stage === "questions" || stage === "analyzing";
  const question = QUESTIONS[questionIndex];

  return (
    <div className="min-h-screen">
      <FloatingBackground />
      <Navbar
        slim={isGameStage}
        onHome={goHome}
        onHow={() => setStage("how")}
        onExplore={() => setStage("explore")}
        onAbout={() => setStage("about")}
        onStart={startJourney}
      />

      <main key={`${stage}-${questionIndex}`} className="animate-stage-in">
        {stage === "welcome" && <WelcomeScreen onStart={startJourney} />}

        {stage === "character" && (
          <CharacterScreen
            selected={character}
            onSelect={setCharacter}
            onNext={() => setStage("questions")}
            onBack={goHome}
          />
        )}

        {stage === "questions" && question && (
          <QuestionScreen
            question={question}
            index={questionIndex}
            total={QUESTIONS.length}
            selected={answers[questionIndex] ?? null}
            onSelect={selectAnswer}
            onNext={nextQuestion}
            onPrev={prevQuestion}
          />
        )}

        {stage === "analyzing" && <AnalyzingScreen onDone={() => setStage("result")} />}

        {stage === "result" && result && (
          <ResultScreen result={result} onRestart={restart} onExplore={() => setStage("explore")} />
        )}

        {stage === "explore" && <ExploreScreen onRestart={restart} onBack={goHome} />}

        {stage === "how" && <HowItWorksScreen onBack={goHome} onStart={startJourney} />}

        {stage === "about" && <AboutClubScreen onBack={goHome} />}
      </main>

      {!isGameStage && (
        <footer className="border-t border-border/60 py-8">
          <div className="mx-auto max-w-6xl px-4 text-center">
            <p className="text-sm font-bold text-foreground">
              اكتشف مسارك — من تطوير <span className="text-gradient-brand">UCAS IT CLUB</span> 💙💚
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              هذه النتيجة استرشادية لمساعدتك على اكتشاف اهتماماتك، وليست بديلاً عن الإرشاد الأكاديمي.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
