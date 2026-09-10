import { useEffect, useState } from "react";

// Replay only after a full document load, not internal navigation.
let pulseDocument: Document | undefined;

/**
 * Decorative background layer: subtle tech grid + soft floating brand blobs.
 */
export function FloatingBackground({ entrancePulse = false }: { entrancePulse?: boolean }) {
  const [showPulse, setShowPulse] = useState(false);
  useEffect(() => {
    if (!entrancePulse || pulseDocument === document) return;
    pulseDocument = document;
    setShowPulse(true);
  }, [entrancePulse]);
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {showPulse && (
        <>
          <div className="club-grid-pulse" />
          <div
            className="club-grid-pulse club-grid-pulse-second"
            onAnimationEnd={() => setShowPulse(false)}
          />
        </>
      )}
      <div className="club-moving-grid absolute inset-0 bg-grid-pattern [mask-image:radial-gradient(ellipse_75%_65%_at_50%_35%,black,transparent)]" />
      <div className="animate-drift absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div
        className="animate-drift absolute top-1/2 -left-32 h-[28rem] w-[28rem] rounded-full bg-accent/10 blur-3xl"
        style={{ animationDelay: "-4s" }}
      />
      <div
        className="animate-drift absolute -bottom-32 right-1/4 h-80 w-80 rounded-full bg-primary/8 blur-3xl"
        style={{ animationDelay: "-7s" }}
      />
    </div>
  );
}
