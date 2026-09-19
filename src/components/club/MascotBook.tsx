import { useEffect, useRef } from "react";
import mascot from "@/assets/club-mascot.png";
import logo from "@/assets/ucas-logo.png";
import "./mascot-book.css";

export function MascotBook({ ar }: { ar: boolean }) {
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    function render() {
      frame = 0;
      if (!element) return;
      const stage = element.querySelector<HTMLElement>(".mascot-book-stage");
      if (!stage) return;
      const range = Math.max(1, element.offsetHeight - stage.offsetHeight);
      const progress = reduced.matches
        ? 1
        : Math.max(0, Math.min(1, (100 - element.getBoundingClientRect().top) / range));
      const eased = progress * progress * (3 - 2 * progress);
      const opening = Math.max(0, Math.min(1, (progress - 0.08) / 0.7));
      element.style.setProperty(
        "--book-width",
        `${Math.min(280, element.clientWidth * 0.82) + (element.clientWidth * 0.96 - Math.min(280, element.clientWidth * 0.82)) * eased}px`,
      );
      element.style.setProperty(
        "--book-height",
        `${Math.min(350, stage.clientHeight * 0.65) + (stage.clientHeight * 0.8 - Math.min(350, stage.clientHeight * 0.65)) * eased}px`,
      );
      element.style.setProperty("--book-angle", `${opening * 105}deg`);
      element.style.setProperty(
        "--cover-opacity",
        String(1 - Math.max(0, (opening - 0.65) / 0.35)),
      );
      element.style.setProperty(
        "--mascot-opacity",
        String(Math.max(0, Math.min(1, (opening - 0.55) / 0.4))),
      );
    }
    function update() {
      if (!frame) frame = requestAnimationFrame(render);
    }
    const observer = new ResizeObserver(update);
    observer.observe(element);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    reduced.addEventListener("change", update);
    render();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      reduced.removeEventListener("change", update);
    };
  }, []);
  return (
    <div ref={track} className="mascot-book-track">
      <section
        className="mascot-book-stage"
        aria-label={ar ? "مرحبًا بك في النادي التكنولوجي" : "Welcome to the Technology Club"}
      >
        <div className="mascot-book-media">
          <p className="mascot-book-welcome">
            {ar ? "أهلًا بك… مكانك بيننا!" : "Welcome… you belong here!"}
          </p>
          <div className="mascot-book-shadow" />
          <img
            className="mascot-book-character"
            src={mascot}
            alt={ar ? "تميمة النادي التكنولوجي" : "Technology Club mascot"}
            width={775}
            height={1216}
          />
          <div className="mascot-book-cover">
            <img src={logo} alt="" width={48} height={58} />
            <small>UCAS IT CLUB</small>
            <h2>{ar ? "كل فكرة عظيمة تبدأ بفضول" : "Every great idea starts with curiosity"}</h2>
            <p>
              {ar
                ? "افتح صفحة جديدة من رحلتك مع النادي التكنولوجي"
                : "Open a new chapter of your journey with the Technology Club"}
            </p>
            <span>{ar ? "مرّر وافتح الحكاية ↓" : "Scroll to open the story ↓"}</span>
          </div>
        </div>
        <a href="#club-home-content" className="mascot-book-skip">
          {ar ? "تخطي المقدمة ↓" : "Skip intro ↓"}
        </a>
      </section>
    </div>
  );
}
