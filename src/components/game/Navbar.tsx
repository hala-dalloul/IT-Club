import { useState } from "react";
import { Menu, X, Rocket } from "lucide-react";
import logo from "@/assets/ucas-logo.png";
import { BrandButton } from "./BrandButton";

interface NavbarProps {
  /** During game stages, render a distraction-free slim bar */
  slim?: boolean;
  onHome: () => void;
  onHow: () => void;
  onExplore: () => void;
  onAbout: () => void;
  onStart: () => void;
}

export function Navbar({ slim = false, onHome, onHow, onExplore, onAbout, onStart }: NavbarProps) {
  const [open, setOpen] = useState(false);

  const links = [
    { label: "الرئيسية", action: onHome },
    { label: "كيف تعمل اللعبة؟", action: onHow },
    { label: "التخصصات", action: onExplore },
    { label: "عن النادي", action: onAbout },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <button
          type="button"
          onClick={onHome}
          className="flex min-w-0 items-center gap-3 rounded-xl"
          aria-label="اكتشف مسارك — الرئيسية"
        >
          <img style={{ objectFit: "contain" }} src={logo} alt="شعار UCAS IT CLUB" width={40} height={40} className="h-10 w-10 shrink-0" />
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-black text-foreground">اكتشف مسارك</span>
            <span className="block truncate text-[11px] font-semibold text-muted-foreground">UCAS IT CLUB</span>
          </span>
        </button>

        {slim ? (
          <span className="text-xs font-bold text-muted-foreground">رحلة اكتشاف المسار 🚀</span>
        ) : (
          <>
            <nav aria-label="التنقل الرئيسي" className="hidden items-center gap-1 md:flex">
              {links.map((link) => (
                <button
                  key={link.label}
                  type="button"
                  onClick={link.action}
                  className="rounded-full px-4 py-2 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {link.label}
                </button>
              ))}
              <BrandButton size="sm" onClick={onStart} className="mr-2">
                <Rocket className="h-4 w-4" />
                ابدأ الرحلة
              </BrandButton>
            </nav>

            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-xl text-foreground md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </>
        )}
      </div>

      {!slim && open && (
        <nav aria-label="قائمة الجوال" className="animate-stage-in border-t border-border/60 bg-background px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => {
                  setOpen(false);
                  link.action();
                }}
                className="rounded-xl px-4 py-3 text-right text-sm font-bold text-foreground transition-colors hover:bg-muted"
              >
                {link.label}
              </button>
            ))}
            <BrandButton
              className="mt-2 w-full"
              onClick={() => {
                setOpen(false);
                onStart();
              }}
            >
              <Rocket className="h-4 w-4" />
              ابدأ الرحلة 🚀
            </BrandButton>
          </div>
        </nav>
      )}
    </header>
  );
}
