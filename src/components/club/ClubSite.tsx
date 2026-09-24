import { FloatingJoin } from "./FloatingJoin";
import { HeroSection } from "@/components/ui/hero-section-4";
import InformationDrawer from "@/components/ui/information-drawer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { collegeUrl, memberGender } from "@/lib/club/model";
import { lazy, Suspense, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Globe,
  Moon,
  Sun,
  Gamepad2,
  Smartphone,
  Palette,
  Users,
  Eye,
  Target,
  CalendarDays,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import "./club.css";
import logo from "@/assets/ucas-logo.webp";
import { BrandButton } from "@/components/club/BrandButton";
import { FloatingBackground } from "@/components/club/FloatingBackground";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { ClubProvider, useClub } from "./ClubProvider";
import { Reveal } from "./Reveal";
import { CountUp } from "./CountUp";
import { SiteFooter } from "./SiteFooter";
import { PrivacyNotice } from "./PrivacyNotice";
import { PrivacyPage } from "./PrivacyPage";
import { useRegistration } from "@/lib/club/registration";
import { THEME_COOKIE, readTheme, writePrefCookie } from "@/lib/club/prefs";
import {
  collections,
  categories,
  committees,
  majors,
  majorEnglishLabels,
  labels,
  local,
  safeUrl,
  contactSchema,
  joinSchema,
  type Content,
  type ContentCollection,
} from "@/lib/club/model";
import { submitToSheet, submissionError } from "@/lib/club/sheets";
import { ContactPage } from "./ContactPage";

// The admin console pulls in the media library, registration tables and their
// deps. Only signed-in staff open it, so keep it out of the visitor bundle.
const AdminPanel = lazy(() => import("./AdminPanel").then((m) => ({ default: m.AdminPanel })));

const nav = [
  ["", "الرئيسية", "Home"],
  ["about", "من نحن", "About"],
  ["members", "الفريق", "Team"],
  ["partners", "الشراكات", "Partners"],
  ["events", "الفعاليات", "Events"],
  ["news", "الأخبار", "News"],
  ["contact", "تواصل معنا", "Contact"],
];

const linkClass =
  "club-action inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary/30 bg-card px-6 py-3 text-base font-bold text-primary transition-colors hover:bg-primary/5";

function ClubLink({
  path = "",
  children,
  className = linkClass,
  navigation = false,
  title,
}: {
  path?: string;
  children: ReactNode;
  className?: string;
  navigation?: boolean;
  title?: string;
}) {
  const target = path ? `/club/${path}` : "/";

  return (
    <Link
      to={target}
      title={title}
      className={className}
      activeOptions={{ exact: !path, includeSearch: false, includeHash: false }}
      data-club-navigation={navigation || undefined}
    >
      {children}
    </Link>
  );
}

function Heading({ ar, en, children }: { ar: string; en: string; children?: ReactNode }) {
  const { lang } = useClub();

  return (
    <div className="mb-10 text-center">
      <p className="text-sm font-bold text-primary">UCAS IT CLUB</p>
      <h1 className="mt-3 text-3xl font-black sm:text-5xl text-gradient-brand">
        {lang === "ar" ? ar : en}
      </h1>
      {children && (
        <div className="mx-auto mt-5 max-w-2xl text-base leading-loose text-muted-foreground">
          {children}
        </div>
      )}
    </div>
  );
}

function Empty() {
  const { lang } = useClub();

  return (
    <p className="rounded-3xl border border-border bg-card p-10 text-center text-muted-foreground">
      {lang === "ar"
        ? "لم يُنشر محتوى في هذا القسم بعد."
        : "No content has been published here yet."}
    </p>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { lang, setLang, loading } = useClub();
  const [open, setOpen] = useState(false);
  // Seeded from the cookie the document was rendered with, so the icon does not
  // swap once hydration catches up.
  const [dark, setDark] = useState(() => readTheme() === "dark");
  useEffect(() => {
    const sync = () => setDark(document.documentElement.classList.contains("dark"));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  const toggleTheme = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.style.colorScheme = next ? "dark" : "light";
    setDark(next);
    writePrefCookie(THEME_COOKIE, next ? "dark" : "light");
    try {
      localStorage.setItem("ucas-theme", next ? "dark" : "light");
    } catch {
      /* Optional storage. */
    }
  };
  const ar = lang === "ar";
  const isAdmin =
    useLocation()
      .pathname.replace(/^\/club\/?/, "")
      .split("/")[0] === "admin";

  return (
    <div dir={ar ? "rtl" : "ltr"} className="club-site relative isolate min-h-screen">
      {!isAdmin && <FloatingBackground entrancePulse={!loading} />}
      <a href="#club-main" className="sr-only focus:not-sr-only">
        {ar ? "انتقل للمحتوى" : "Skip to content"}
      </a>
      <header className="club-header sticky top-3 z-40 mx-auto max-w-7xl px-3 sm:px-4">
        <div className="club-header-surface">
          <div className="club-header-row flex items-center justify-between gap-2 px-3 py-2 sm:px-4">
            <ClubLink className="club-header-brand flex shrink-0 items-center gap-2">
              <img
                src={logo}
                width={44}
                height={56}
                className="h-9 w-8 object-contain"
                alt="UCAS IT CLUB"
              />
              <span className="text-sm font-black">UCAS IT CLUB</span>
            </ClubLink>
            <nav
              aria-label={ar ? "التنقل الرئيسي" : "Main navigation"}
              className="club-nav-bar hidden min-w-0 flex-1 items-center justify-center gap-1 xl:flex"
            >
              {nav.map(([path, a, e]) => (
                <ClubLink
                  key={path}
                  path={path!}
                  navigation
                  className="club-nav-link rounded-full px-3 py-2 text-sm font-bold aria-[current=page]:bg-brand-gradient"
                >
                  {ar ? a : e}
                </ClubLink>
              ))}
            </nav>
            <div className="club-header-actions flex shrink-0 items-center gap-1">
              <BrandButton
                variant="ghost"
                size="sm"
                className="club-language-button"
                onClick={() => setLang(ar ? "en" : "ar")}
                aria-label={ar ? "Switch to English" : "التبديل للعربية"}
              >
                <Globe size={16} />
                {ar ? "EN" : "عربي"}
              </BrandButton>
              <button
                type="button"
                onClick={toggleTheme}
                className="club-theme-button rounded-full p-2.5"
                aria-label={
                  ar
                    ? dark
                      ? "تفعيل الوضع الفاتح"
                      : "تفعيل الوضع الداكن"
                    : dark
                      ? "Use light theme"
                      : "Use dark theme"
                }
                aria-pressed={dark}
                title={
                  ar
                    ? dark
                      ? "الوضع الفاتح"
                      : "الوضع الداكن"
                    : dark
                      ? "Light theme"
                      : "Dark theme"
                }
              >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                type="button"
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                aria-label={ar ? "القائمة" : "Menu"}
                className="rounded-xl p-2 xl:hidden"
              >
                {open ? <X /> : <Menu />}
              </button>
            </div>
          </div>
          {open && (
            <nav className="grid grid-cols-2 gap-2 border-t border-border p-4 xl:hidden">
              {nav.map(([path, a, e]) => (
                <span key={path} onClick={() => setOpen(false)}>
                  <ClubLink
                    path={path!}
                    navigation
                    className="club-nav-link block rounded-xl p-3 text-sm font-bold aria-[current=page]:bg-brand-gradient"
                  >
                    {ar ? a : e}
                  </ClubLink>
                </span>
              ))}
            </nav>
          )}
        </div>
      </header>
      <main
        id="club-main"
        tabIndex={-1}
        className={`mx-auto max-w-6xl px-4 animate-stage-in ${["/", "/club", "/club/"].includes(location.pathname) ? "pt-4 pb-12 sm:pt-5 sm:pb-16" : "py-12 sm:py-16"}`}
      >
        {children}
      </main>
      {!isAdmin && !location.pathname.startsWith("/club/join") && (
        <FloatingJoin ar={lang === "ar"} />
      )}
      <PrivacyNotice ar={ar} />
      {/* The footer reads as the end of the page, so keep it out of the way
          until the content it sits under has actually arrived. */}
      {!isAdmin && !loading && <SiteFooter />}
    </div>
  );
}

function Card({
  item,
  kind,
  compact = false,
}: {
  item: Content;
  kind: Exclude<ContentCollection, "members">;
  compact?: boolean;
}) {
  const { lang } = useClub();
  const title = local(item, "title", lang);
  const image = item.images?.map(safeUrl).find(Boolean);
  const partner = kind === "partners";
  const status = item.status === "upcoming" || item.status === "past" ? item.status : undefined;

  return (
    <article className="club-card flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-card">
      <div className="relative aspect-video w-full overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={title}
            loading="lazy"
            width={640}
            height={360}
            className={`club-card-media h-full w-full ${partner ? "club-partner-media object-contain p-6" : "object-cover"}`}
          />
        ) : (
          <div className="club-card-media flex h-full w-full items-center justify-center bg-brand-gradient">
            <img
              src={logo}
              alt=""
              aria-hidden="true"
              className="h-16 w-14 object-contain opacity-90 brightness-0 invert"
            />
          </div>
        )}
        {/* Upcoming or past reads at a glance instead of only from the filter. */}
        {status && (
          <span className="absolute end-3 top-3 rounded-full bg-background/85 px-3 py-1 text-xs font-bold text-primary shadow-card backdrop-blur-sm">
            {status === "upcoming"
              ? lang === "ar"
                ? "قادمة"
                : "Upcoming"
              : lang === "ar"
                ? "سابقة"
                : "Past"}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        {item.date && (
          <time
            dateTime={item.date}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"
          >
            <CalendarDays size={14} aria-hidden="true" />
            {item.date}
          </time>
        )}
        <h2 className="mt-2 text-xl font-extrabold">{title}</h2>
        <p
          className={`mt-3 text-base leading-relaxed text-muted-foreground ${compact ? "line-clamp-2" : "line-clamp-3"}`}
        >
          {local(item, "description", lang)}
        </p>
        {partner ? (
          <div className="mt-auto pt-5">
            {item.partnershipType && (
              <p className="mb-3 inline-flex rounded-full bg-brand-gradient-soft px-3 py-1 text-sm font-bold text-primary">
                {local(item, "partnershipType", lang)}
              </p>
            )}
            {safeUrl(item.websiteUrl) && (
              <a
                href={safeUrl(item.websiteUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 font-bold text-primary"
              >
                {lang === "ar" ? "موقع الشريك" : "Visit partner"}
                <ExternalLink size={16} />
              </a>
            )}
          </div>
        ) : (
          <ClubLink
            path={`${kind}/${item.id}`}
            className="club-card-cta mt-auto inline-flex items-center gap-2 pt-5 font-bold text-primary"
          >
            {lang === "ar" ? "التفاصيل" : "View details"}
            {lang === "ar" ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
          </ClubLink>
        )}
      </div>
    </article>
  );
}

function Grid({
  items,
  kind,
  compact = false,
}: {
  items: Content[];
  kind: ContentCollection;
  compact?: boolean;
}) {
  const { lang } = useClub();

  if (kind === "members")
    return items.length ? <InformationDrawer teams={items} lang={lang} /> : <Empty />;

  return items.length ? (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => (
        // Stagger across the row only, so a long list never waits on its own index.
        <Reveal key={item.id} delay={(i % 3) * 110}>
          <Card item={item} kind={kind} compact={compact} />
        </Reveal>
      ))}
    </div>
  ) : (
    <Empty />
  );
}

function Home() {
  const { lang, data, visitorCount } = useClub();
  const ar = lang === "ar";
  const past = data.events.filter((x) => x.status === "past");
  const upcoming = data.events.filter((x) => x.status !== "past");
  const preview = (upcoming.length ? upcoming : past).slice(0, 3);

  return (
    <>
      <HeroSection className="mx-auto max-w-4xl text-center">
        <div className="club-hero-mark mx-auto w-fit">
          <img
            src={logo}
            alt="UCAS IT CLUB"
            width={124}
            height={160}
            className="club-hero-logo h-24 w-auto object-contain sm:h-28"
          />
        </div>
        <p className="mt-4 font-bold text-primary">
          {ar ? "النادي التكنولوجي" : "Technology Club"}
          <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
            {ar ? "الكلية الجامعية للعلوم التطبيقية" : "University College of Applied Sciences"}
          </span>
        </p>
        <h1 className="mt-4 text-4xl font-black leading-tight sm:text-6xl text-gradient-brand">
          {ar ? "نتعلم نبتكر نتقدم" : "Learn, innovate, advance"}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-lg leading-loose text-muted-foreground">
          {ar
            ? "مجتمع طلابي يجمع المهتمين بالتقنية. تعرّف على فريق النادي وفعالياته، وكن جزءًا من التجربة."
            : "A student community for technology enthusiasts. Meet the team and take part in club activities."}
        </p>
      </HeroSection>

      {/* The club's totals live here and nowhere else. */}
      <div className="mt-8 mb-14 grid grid-cols-3 gap-3">
        {(
          [
            [Users, data.members.length, ar ? "الأعضاء" : "Members"],
            [Eye, visitorCount, ar ? "الزيارات" : "Visits"],
            [CalendarDays, past.length, ar ? "فعاليات منفذة" : "Past events"],
          ] as const
        ).map(([Icon, n, label], i) => (
          <Reveal key={label} delay={i * 90}>
            <div className="club-card h-full rounded-3xl border border-border bg-card p-5 text-center shadow-card">
              <Icon className="mx-auto text-primary" />
              <strong className="my-2 block text-3xl font-black sm:text-4xl">
                <CountUp value={n} />
              </strong>
              <span className="text-sm font-bold text-muted-foreground">{label}</span>
            </div>
          </Reveal>
        ))}
      </div>

      <section className="mt-16">
        <Reveal>
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="club-rule text-2xl font-black">
              {ar
                ? upcoming.length
                  ? "الفعاليات القادمة"
                  : "فعاليات نفّذها النادي"
                : upcoming.length
                  ? "Upcoming events"
                  : "Events the club has run"}
            </h2>
            <ClubLink path="events" className="text-sm font-bold text-primary">
              {ar ? "كل الفعاليات" : "All events"}
            </ClubLink>
          </div>
        </Reveal>
        <Grid items={preview} kind="events" compact />
      </section>

      <section className="mt-16">
        <Reveal>
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="club-rule text-2xl font-black">
              {ar ? "من أخبار النادي" : "Club news"}
            </h2>
            <ClubLink path="news" className="text-sm font-bold text-primary">
              {ar ? "كل الأخبار" : "All news"}
            </ClubLink>
          </div>
        </Reveal>
        <Grid items={data.news.slice(0, 3)} kind="news" compact />
      </section>
    </>
  );
}

function About() {
  const { lang, settings, data } = useClub();
  const ar = lang === "ar";
  const goals = (settings[ar ? "goals" : "goals_en"] || "").split("\n").filter(Boolean);

  return (
    <>
      <Heading ar="من نحن" en="About the club">
        {ar ? "نادٍ طلابي في " : "A student-run club at the "}
        <a
          href={collegeUrl[lang]}
          target="_blank"
          rel="noopener"
          className="font-bold text-primary underline-offset-4 hover:underline"
        >
          {ar ? "الكلية الجامعية للعلوم التطبيقية" : "University College of Applied Sciences"}
        </a>
        {ar
          ? "، يديره طلبته ويجمع المهتمين بالبرمجة والتصميم والألعاب والوسائط."
          : " for everyone working in code, design, games and media."}
      </Heading>

      <div className="grid gap-6 sm:grid-cols-2">
        {(["vision", "mission"] as const).map((key, i) => {
          // SAFETY: key is "vision" | "mission" from the as-const array above, so
          // `${key}_en` is exactly "vision_en" | "mission_en".
          const enKey = `${key}_en` as "vision_en" | "mission_en";
          const Icon = key === "vision" ? Eye : Target;

          return (
            <Reveal key={key} delay={i * 110}>
              <article className="club-card h-full rounded-3xl border border-border bg-card p-8 shadow-card">
                <span className="inline-flex rounded-2xl bg-brand-gradient-soft p-3 text-primary">
                  <Icon className="h-6 w-6" />
                </span>
                <h2 className="club-rule mt-5 text-2xl font-black text-primary">
                  {key === "vision"
                    ? ar
                      ? "رؤيتنا"
                      : "Our vision"
                    : ar
                      ? "رسالتنا"
                      : "Our mission"}
                </h2>
                <p className="mt-5 whitespace-pre-line text-base leading-loose text-muted-foreground">
                  {settings[ar ? key : enKey] ||
                    (ar
                      ? "سيُنشر النص الرسمي المعتمد قريبًا."
                      : "The approved official statement will be published here.")}
                </p>
              </article>
            </Reveal>
          );
        })}
      </div>

      <Reveal as="h2" className="club-rule mt-14 mb-3 text-2xl font-black">
        {ar ? "كيف يعمل النادي" : "How the club works"}
      </Reveal>
      <p className="mb-6 max-w-2xl leading-loose text-muted-foreground">
        {ar
          ? "العمل موزّع على ثلاث لجان، وكل عضو ينتمي إلى واحدة منها."
          : "The work is split across three committees, and every member belongs to one."}
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        {committees.map(([key, a, e], i) => {
          const count = data.members.filter((m) => m.committee === key).length;

          return (
            <Reveal key={key} delay={i * 90}>
              <ClubLink
                path="members"
                className="club-card flex h-full flex-col rounded-3xl border border-border bg-card p-6 shadow-card"
              >
                <span aria-hidden="true" className="h-1.5 w-12 rounded-full bg-brand-gradient" />
                <h3 className="mt-5 text-xl font-extrabold">{ar ? a : e}</h3>
                <p className="mt-2 text-sm font-bold text-muted-foreground">
                  <CountUp value={count} />{" "}
                  {ar ? (count === 1 ? "عضو" : "أعضاء") : count === 1 ? "member" : "members"}
                </p>
              </ClubLink>
            </Reveal>
          );
        })}
      </div>

      <Reveal as="h2" className="club-rule mt-14 mb-6 text-2xl font-black">
        {ar ? "أهدافنا" : "Our goals"}
      </Reveal>
      {goals.length ? (
        <ol className="grid gap-4 sm:grid-cols-2">
          {goals.map((goal, i) => (
            <Reveal key={i} as="li" delay={(i % 2) * 110}>
              <div className="club-card flex h-full gap-4 rounded-3xl bg-brand-gradient-soft p-6">
                <strong
                  aria-hidden="true"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-sm font-black text-white"
                >
                  {i + 1}
                </strong>
                <span className="leading-loose">{goal}</span>
              </div>
            </Reveal>
          ))}
        </ol>
      ) : (
        <Empty />
      )}

      <Reveal as="h2" className="club-rule mt-14 mb-6 text-2xl font-black">
        {ar ? "مجالات عملنا" : "Our fields"}
      </Reveal>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map(([key, a, e], i) => {
          const Icon = [Smartphone, Globe, Gamepad2, Palette][i]!;

          return (
            <Reveal key={key} delay={i * 80}>
              <div className="club-card group h-full rounded-3xl border border-border bg-card p-6 shadow-card">
                <span className="inline-flex rounded-2xl bg-brand-gradient-soft p-3 text-primary transition-colors group-hover:bg-brand-gradient group-hover:text-white">
                  <Icon className="h-7 w-7" />
                </span>
                <h3 className="mt-4 font-extrabold">{ar ? a : e}</h3>
              </div>
            </Reveal>
          );
        })}
      </div>
    </>
  );
}

function Listing({ kind }: { kind: ContentCollection }) {
  const { lang, data } = useClub();
  const ar = lang === "ar";
  const [status, setStatus] = useState("all");
  let items = data[kind].filter((x) => status === "all" || x.status === status);

  if (kind === "events" || kind === "news")
    items = [...items].sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  return (
    <>
      <Heading ar={labels[kind][0]} en={labels[kind][1]} />
      {kind === "events" && (
        <div className="mb-8 flex flex-wrap gap-3">
          {[
            ["all", "الكل", "All"],
            ["upcoming", "قادمة", "Upcoming"],
            ["past", "سابقة", "Past"],
          ].map(([key, a, e]) => (
            <BrandButton
              key={key}
              variant={status === key ? "primary" : "outline"}
              onClick={() => setStatus(key!)}
              aria-pressed={status === key}
            >
              {ar ? a : e}
            </BrandButton>
          ))}
        </div>
      )}
      {kind === "members" ? (
        <>
          <h2 className="mb-6 text-2xl font-black">
            {ar ? "الهيئة الإدارية" : "Administrative board"}
          </h2>
          <Grid
            kind={kind}
            items={items
              .filter((x) => x.isFounder || x.committee === "administrative")
              .sort((a, b) => (a.displayOrder ?? 10000) - (b.displayOrder ?? 10000))}
          />
          {committees.map(([key, a, e]) => (
            <section key={key} className="mt-10">
              <Tabs defaultValue="male" dir={ar ? "rtl" : "ltr"}>
                <div className="mb-5 flex flex-wrap items-center gap-4">
                  <h2 className="text-xl font-black text-primary">{ar ? a : e}</h2>
                  <TabsList
                    aria-label={ar ? `أعضاء لجنة ${a}` : `${e} members`}
                    className="h-auto rounded-full border border-primary/20 bg-card p-1"
                  >
                    <TabsTrigger
                      value="male"
                      className="rounded-full px-5 py-2 text-primary data-[state=active]:bg-brand-gradient data-[state=active]:text-primary-foreground"
                    >
                      {ar ? "الطلاب" : "Male students"}
                    </TabsTrigger>
                    <TabsTrigger
                      value="female"
                      className="rounded-full px-5 py-2 text-primary data-[state=active]:bg-brand-gradient data-[state=active]:text-primary-foreground"
                    >
                      {ar ? "الطالبات" : "Female students"}
                    </TabsTrigger>
                  </TabsList>
                </div>
                {(["male", "female"] as const).map((gender) => (
                  <TabsContent key={gender} value={gender}>
                    <Grid
                      kind={kind}
                      items={items.filter(
                        (x) => !x.isFounder && x.committee === key && memberGender(x) === gender,
                      )}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            </section>
          ))}
        </>
      ) : (
        <Grid items={items} kind={kind} />
      )}
    </>
  );
}

function Detail({ kind, id }: { kind: ContentCollection; id: string }) {
  const { data, lang } = useClub();
  const item =
    data[kind].find((x) => x.id === id) ??
    (kind === "events"
      ? data.news.find((x) => x.id === id)
      : kind === "news"
        ? data.events.find((x) => x.id === id)
        : undefined);
  const ar = lang === "ar";

  if (!item)
    return (
      <>
        <Heading ar="المحتوى غير موجود" en="Content not found" />
        <ClubLink path={kind}>{ar ? "العودة للقائمة" : "Back to list"}</ClubLink>
      </>
    );

  return (
    <>
      <Heading ar={item.title} en={item.title_en} />
      <article className="rounded-[2rem] border border-border bg-card p-6 shadow-card sm:p-10">
        {item.date && (
          <time dateTime={item.date} className="text-primary font-bold">
            {item.date}
          </time>
        )}
        {item.role && <p className="font-bold text-primary">{local(item, "role", lang)}</p>}
        <p className="mt-5 whitespace-pre-line text-base leading-loose text-muted-foreground">
          {local(item, "description", lang)}
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {item.images
            ?.filter((x) => safeUrl(x))
            .map((url, i) => (
              <img
                key={url}
                src={url}
                alt={`${local(item, "title", lang)} — ${i + 1}`}
                width={800}
                height={600}
                loading="lazy"
                className="w-full rounded-2xl object-contain"
              />
            ))}
        </div>
        <div className="mt-7 flex flex-wrap gap-3">
          {(
            [
              ["githubUrl", "GitHub"],
              ["linkedinUrl", "LinkedIn"],
            ] as const
          ).map(
            ([key, label]) =>
              safeUrl(item[key]) && (
                <a
                  key={key}
                  href={safeUrl(item[key])}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  {label}
                  <ExternalLink size={16} />
                </a>
              ),
          )}
        </div>
      </article>
      <div className="mt-8">
        <ClubLink path={kind}>{ar ? "العودة للقائمة" : "Back to list"}</ClubLink>
      </div>
    </>
  );
}

function PublicForm({ join }: { join: boolean }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const { lang, settings } = useClub();
  const ar = lang === "ar";
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const feedback = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (message) feedback.current?.focus();
  }, [message]);
  const requestId = useRef<string | undefined>(undefined);
  // Shared query, fetched once per session. This form used to ask Google Apps
  // Script — a ~3s call — on mount and then every fifteen seconds while open.
  const registration = useRegistration();

  const [major, setMajor] = useState("");
  const [committee, setCommittee] = useState<string>(committees[0][0]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (busy) return;
    const form = e.currentTarget;
    // SAFETY: this form has no file inputs, so every FormData entry value is a string.
    const values = Object.fromEntries(new FormData(form)) as Record<string, string>;

    if (join) {
      values["preferredCommittee"] = committee;
      values["major"] = major;
    }

    const parsed = (join ? joinSchema : contactSchema).safeParse(values);

    if (!parsed.success) {
      const errors = {
        name: ["أدخلي الاسم من حرفين إلى 200 حرف.", "Enter a name of 2–200 characters."],
        fullName: [
          "أدخلي الاسم الكامل من حرفين إلى 200 حرف.",
          "Enter a full name of 2–200 characters.",
        ],
        email: [
          "أدخلي بريدًا جامعيًا ينتهي بـ @smail.ucas.edu.ps.",
          "Enter your @smail.ucas.edu.ps email address.",
        ],
        studentId: [
          "الرقم الجامعي يجب أن يتكوّن من 9 أرقام.",
          "Student ID must contain exactly 9 digits.",
        ],
        major: ["اختاري التخصص من القائمة.", "Select your major."],
        preferredCommittee: ["اختاري اللجنة المرغوبة.", "Select a committee."],
        phone: [
          "رقم الهاتف يجب أن يبدأ بـ 056 أو 059 ويتكوّن من 9 أو 10 أرقام.",
          "Phone must start with 056 or 059 and contain 9 or 10 digits.",
        ],
        message: [
          "النص يجب أن يكون بين 10 و4000 حرف.",
          "Your message must contain 10–4000 characters.",
        ],
      } satisfies Record<string, [string, string]>;

      const errorFor = (field: string) => {
        if (!Object.hasOwn(errors, field)) return undefined;

        // SAFETY: hasOwn above confirms field is one of errors' known keys.
        return errors[field as keyof typeof errors];
      };

      setMessage(
        [
          ...new Set(
            parsed.error.issues.map(
              (issue) =>
                errorFor(String(issue.path[0]))?.[ar ? 0 : 1] ||
                (ar ? "تحققي من الحقول." : "Check your fields."),
            ),
          ),
        ].join(" "),
      );

      return;
    }

    setBusy(true);
    setMessage("");

    try {
      requestId.current ??= crypto.randomUUID();
      await submitToSheet(join, parsed.data, requestId.current);
      setSuccess(true);
      form.reset();
    } catch (error) {
      setMessage(submissionError(error, ar));

      if (error instanceof Error && error.message === "JOIN_CLOSED") {
        registration.markClosed();
      }
    } finally {
      setBusy(false);
    }
  }

  const fields = join
    ? [
        ["fullName", "الاسم الكامل", "Full name", "text"],
        ["email", "البريد الإلكتروني", "Email", "email"],
        ["phone", "الهاتف (اختياري)", "Phone (optional)", "tel"],
        ["studentId", "الرقم الجامعي", "Student ID", "text"],
      ]
    : [
        ["name", "الاسم", "Name", "text"],
        ["email", "البريد الإلكتروني", "Email", "email"],
      ];

  return (
    <>
      <Heading ar={join ? "انضم إلينا" : "تواصل معنا"} en={join ? "Join the club" : "Contact us"} />
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-border bg-card p-6 shadow-card sm:p-10">
        {!ready ? (
          <p role="status">{ar ? "جارٍ تجهيز النموذج…" : "Preparing the form…"}</p>
        ) : success ? (
          <div
            role="status"
            className="rounded-2xl bg-brand-gradient-soft p-6 text-primary font-bold"
          >
            {ar
              ? "تهانينا على وصول طلب الإنضمام قريبا سيتم مراجعة طلبك و إرسالة رسالة القبول"
              : "Your submission has been saved successfully. Thank you."}
          </div>
        ) : join && !registration.open ? (
          <p
            role="status"
            className="rounded-2xl bg-brand-gradient-soft p-6 font-bold text-primary"
          >
            {registration.failed
              ? ar
                ? "استقبال الطلبات غير متاح حاليًا. يرجى المحاولة لاحقًا."
                : "Applications are currently unavailable. Please try later."
              : registration.loading
                ? ar
                  ? "جارٍ التحقق من استقبال الطلبات…"
                  : "Checking registration availability…"
                : ar
                  ? "تم وقف استقبال الأعضاء الجدد"
                  : "New membership applications are closed."}
          </p>
        ) : (
          <form noValidate onSubmit={submit} className="space-y-5" aria-busy={busy}>
            {fields.map(([name, a, en, type]) => (
              <label key={name} className="block text-sm font-bold">
                <span className="mb-2 block">{ar ? a : en}</span>
                <Input
                  name={name!}
                  type={type!}
                  required={name !== "phone"}
                  maxLength={
                    name === "studentId" ? 9 : name === "phone" ? 10 : name === "email" ? 254 : 200
                  }
                  minLength={name === "studentId" || name === "phone" ? 9 : undefined}
                  inputMode={name === "studentId" || name === "phone" ? "numeric" : undefined}
                  pattern={
                    name === "studentId"
                      ? "[0-9]{9}"
                      : name === "phone"
                        ? "05[69][0-9]{6,7}"
                        : name === "email" && join
                          ? "[^@]+@smail\\.ucas\\.edu\\.ps"
                          : undefined
                  }
                  title={
                    name === "studentId"
                      ? ar
                        ? "أدخل الرقم الجامعي المكوّن من 9 أرقام"
                        : "Enter a 9-digit student ID"
                      : undefined
                  }
                  onInput={
                    name === "studentId" || name === "phone"
                      ? (e) => {
                          e.currentTarget.value = e.currentTarget.value
                            .replace(/[^0-9]/g, "")
                            .slice(0, name === "phone" ? 10 : 9);
                        }
                      : undefined
                  }
                  autoComplete={
                    name === "email"
                      ? "email"
                      : name === "phone"
                        ? "tel"
                        : name === "name" || name === "fullName"
                          ? "name"
                          : "off"
                  }
                />
              </label>
            ))}
            {join && (
              <label className="block text-sm font-bold">
                <span className="mb-2 block">{ar ? "التخصص" : "Major"}</span>
                <Select dir={ar ? "rtl" : "ltr"} value={major} onValueChange={setMajor} required>
                  <SelectTrigger className="h-auto min-h-10 whitespace-normal text-start">
                    <SelectValue placeholder={ar ? "اختاري التخصص" : "Select a major"} />
                  </SelectTrigger>
                  <SelectContent>
                    {majors.map((name) => (
                      <SelectItem key={name} value={name}>
                        {ar ? name : majorEnglishLabels[name]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
            )}
            {join && (
              <label className="block text-sm font-bold">
                <span className="mb-2 block">{ar ? "اللجنة المرغوبة" : "Preferred committee"}</span>
                <Select dir={ar ? "rtl" : "ltr"} value={committee} onValueChange={setCommittee}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {committees.map(([key, a, en]) => (
                      <SelectItem key={key} value={key}>
                        {ar ? a : en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
            )}
            <label className="block text-sm font-bold">
              <span className="mb-2 block">
                {ar ? (join ? "عرّفنا بنفسك" : "الرسالة") : join ? "Introduce yourself" : "Message"}
              </span>
              <Textarea
                name="message"
                required
                minLength={10}
                maxLength={4000}
                rows={5}
                wrap="soft"
                className="resize-y whitespace-pre-wrap [overflow-wrap:anywhere] leading-7"
              />
            </label>
            <p className="text-sm text-muted-foreground">
              {ar
                ? "تُستخدم بياناتك للرد على رسالتك أو مراجعة طلب انضمامك من إدارة النادي."
                : "Club administrators use your details to respond to your message or review your membership request."}
            </p>
            {message && (
              <p
                ref={feedback}
                tabIndex={-1}
                role="alert"
                className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-primary"
              >
                {message}
              </p>
            )}
            {busy && (
              <p role="status" className="text-primary">
                {ar
                  ? "جارٍ إرسال الطلب إلى Google Sheets، انتظري تأكيد الحفظ…"
                  : "Sending to Google Sheets. Please wait for confirmation…"}
              </p>
            )}
            <BrandButton
              type="submit"
              disabled={busy || (join && !registration.open)}
            >
              {busy ? (ar ? "جارٍ الإرسال…" : "Sending…") : ar ? "إرسال" : "Submit"}
            </BrandButton>
          </form>
        )}
        {settings.email && (
          <a className="mt-6 block text-primary" href={`mailto:${settings.email}`}>
            {settings.email}
          </a>
        )}
      </div>
    </>
  );
}

function Missing() {
  const { lang } = useClub();

  return (
    <>
      <Heading ar="الصفحة غير موجودة" en="Page not found" />
      <div className="text-center">
        <ClubLink>{lang === "ar" ? "العودة للرئيسية" : "Back to home"}</ClubLink>
      </div>
    </>
  );
}

function ContentPage({ notFound }: { notFound: boolean }) {
  const { loading, error, lang } = useClub();

  const path = useLocation()
    .pathname.replace(/^\/club\/?/, "")
    .replace(/\/$/, "");

  const [page, id] = path.split("/");

  // The router already answered 404; don't let the path render a real page.
  if (notFound) return <Missing />;

  if (page === "admin")
    return (
      <Suspense
        fallback={
          <div role="status" className="flex min-h-[45vh] items-center justify-center">
            <span className="sr-only">{lang === "ar" ? "تحميل الإدارة" : "Loading admin"}</span>
          </div>
        }
      >
        <AdminPanel />
      </Suspense>
    );

  if (page === "join") return <PublicForm join />;

  if (page === "contact") return <ContactPage />;

  if (page === "privacy") return <PrivacyPage />;

  if (loading)
    return (
      <div role="status" className="flex min-h-[45vh] items-center justify-center">
        <img src={logo} alt="UCAS IT CLUB" className="h-64 w-64 object-contain sm:h-80 sm:w-80" />
        <span className="sr-only">{lang === "ar" ? "تحميل الموقع" : "Loading website"}</span>
      </div>
    );

  if (error)
    return (
      <p role="alert" className="py-20 text-center">
        {lang === "ar"
          ? "تعذر تحميل المحتوى. يرجى تحديث الصفحة والمحاولة مجددًا."
          : "Content could not be loaded. Please refresh and try again."}
      </p>
    );

  if (!page) return <Home />;

  if (page === "about") return <About />;

  // SAFETY: the cast only satisfies Array<ContentCollection>.includes's parameter type;
  // the membership check below is still a plain, correct string comparison.
  if (collections.includes(page as ContentCollection))
    // SAFETY: collections.includes above just confirmed page is a ContentCollection.
    return id ? (
      <Detail kind={page as ContentCollection} id={id} />
    ) : (
      <Listing key={page} kind={page as ContentCollection} />
    );

  return <Missing />;
}

/** `notFound` renders the site's chrome around a not-found message, for 404 responses. */
export function ClubSite({ notFound = false }: { notFound?: boolean }) {
  return (
    <ClubProvider>
      <Shell>
        <ContentPage notFound={notFound} />
      </Shell>
    </ClubProvider>
  );
}
