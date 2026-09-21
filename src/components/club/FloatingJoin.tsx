import { Link } from "@tanstack/react-router";
import { useRegistration } from "@/lib/club/registration";
import mascot from "@/assets/club-mascot.png";

/**
 * Shown only while the club is actually taking applications.
 *
 * The status comes from the shared registration query, so this costs no request
 * of its own. It used to ask Google Apps Script — a ~3s call — on mount, every
 * fifteen seconds, on every focus and on every visibility change, from every
 * page, to decide whether to render a button that is hidden most of the year.
 */
export function FloatingJoin({ ar }: { ar: boolean }) {
  const { open } = useRegistration();

  if (!open) return null;

  return (
    <Link
      to="/club/$"
      params={{ _splat: "join" }}
      aria-label={ar ? "انضم إلينا" : "Join us"}
      className="stitch fixed bottom-4 start-3 z-30 flex w-20 flex-col items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:start-5 sm:w-24"
      style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <span className="whitespace-nowrap border border-foreground bg-background px-3 py-2 text-xs font-bold">
        {ar ? "انضم إلينا" : "Join us"}
      </span>
      <img
        src={mascot}
        alt=""
        width={301}
        height={472}
        className="h-24 w-auto object-contain sm:h-28"
      />
    </Link>
  );
}
