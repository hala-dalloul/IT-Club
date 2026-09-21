import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { loadRegistration } from "@/lib/club/sheets";
import mascot from "@/assets/club-mascot.png";

export function FloatingJoin({ ar }: { ar: boolean }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    let active = true;
    let pending = false;
    async function refresh() {
      if (pending || document.visibilityState === "hidden") return;
      pending = true;
      try {
        const status = await loadRegistration();
        if (active)
          setOpen(
            status.enabled && status.open && status.count < status.limit && status.remaining > 0,
          );
      } catch {
        if (active) setOpen(false);
      } finally {
        pending = false;
      }
    }
    void refresh();
    const timer = window.setInterval(refresh, 15000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);
  if (!open) return null;
  return (
    <Link
      to="/club/$"
      params={{ _splat: "join" }}
      aria-label={ar ? "انضم إلينا" : "Join us"}
      className="fixed bottom-4 left-3 z-30 flex w-20 flex-col items-center gap-1 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:left-5 sm:w-24"
      style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <span className="whitespace-nowrap rounded-full border border-border bg-card px-3 py-2 text-xs font-bold text-primary shadow-card">
        {ar ? "انضم إلينا" : "Join us"}
      </span>
      <img
        src={mascot}
        alt=""
        width={775}
        height={1216}
        className="h-24 w-auto object-contain sm:h-28"
      />
    </Link>
  );
}
