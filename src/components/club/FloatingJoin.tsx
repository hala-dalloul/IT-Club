import { Link } from "@tanstack/react-router";
import { useClub } from "./ClubProvider";
import mascot from "@/assets/club-mascot.webp";

/**
 * Shown only while the club is advertising membership.
 *
 * Reads the flag the admin screen mirrors into club_settings, which arrives
 * with the club payload the page has already fetched, so this button costs no
 * request at all. It used to ask Google Apps Script — a ~3s call — on mount,
 * every fifteen seconds, on every focus and on every visibility change, from
 * every page, to decide whether to render something hidden most of the year.
 *
 * The flag can lag reality if the sheet fills up without an admin touching the
 * settings. That is why it only governs this button: the join page asks Apps
 * Script directly and is the one that tells a visitor the truth.
 */
export function FloatingJoin({ ar }: { ar: boolean }) {
  const { settings } = useClub();

  if (!settings.registrationOpen) return null;

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
