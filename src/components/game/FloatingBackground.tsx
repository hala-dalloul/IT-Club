/**
 * Decorative background layer: subtle tech grid + soft floating brand blobs.
 */
export function FloatingBackground({ animatedSquares = false }: { animatedSquares?: boolean }) {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {animatedSquares && (
        <div className="club-floating-squares absolute inset-0">
          {Array.from({ length: 8 }, (_, i) => (
            <span
              key={i}
              className="club-floating-square"
              style={{
                left: [5, 16, 83, 93, 8, 88, 25, 72][i] + "%",
                top: [12, 62, 18, 55, 84, 86, 35, 70][i] + "%",
                width: [34, 48, 42, 28, 38, 52, 26, 32][i],
                height: [34, 48, 42, 28, 38, 52, 26, 32][i],
                animationDelay: -i * 1.7 + "s",
                animationDuration: 10 + (i % 4) * 2 + "s",
              }}
            />
          ))}
        </div>
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
