import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Globe,
  Gamepad2,
  Smartphone,
  Palette,
  Users,
  FolderOpen,
  CalendarDays,
  Menu,
  X,
  ExternalLink,
  ImageOff,
} from "lucide-react";
import "./club.css";
import logo from "@/assets/ucas-logo.png";
import { BrandButton } from "@/components/game/BrandButton";
import { FloatingBackground } from "@/components/game/FloatingBackground";
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
import {
  collections,
  categories,
  committees,
  majors,
  labels,
  local,
  safeUrl,
  contactSchema,
  joinSchema,
  type Content,
  type ContentCollection,
} from "@/lib/club/model";
import { configured, submitForm } from "@/lib/club/supabase";
import { AdminPanel } from "./AdminPanel";
const nav = [
  ["", "الرئيسية", "Home"],
  ["about", "من نحن", "About"],
  ["projects", "المشاريع", "Projects"],
  ["members", "الفريق", "Team"],
  ["achievements", "الإنجازات", "Achievements"],
  ["partners", "الشراكات", "Partners"],
  ["events", "الفعاليات", "Events"],
  ["contact", "تواصل معنا", "Contact"],
];
const linkClass =
  "club-action inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary/30 bg-card px-6 py-3 text-base font-bold text-primary transition-colors hover:bg-primary/5";
function ClubLink({
  path = "",
  children,
  className = linkClass,
  navigation = false,
}: {
  path?: string;
  children: ReactNode;
  className?: string;
  navigation?: boolean;
}) {
  const target = path ? `/club/${path}` : "/club";
  return (
    <Link
      to={target}
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
  const { lang, setLang, settings } = useClub();
  const [open, setOpen] = useState(false);
  const ar = lang === "ar";
  return (
    <div dir={ar ? "rtl" : "ltr"} className="club-site min-h-screen">
      <FloatingBackground />
      <a href="#club-main" className="sr-only focus:not-sr-only">
        {ar ? "انتقل للمحتوى" : "Skip to content"}
      </a>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <ClubLink className="flex items-center gap-3">
            <img
              src={logo}
              width={44}
              height={56}
              className="h-12 w-10 object-contain"
              alt="UCAS IT CLUB"
            />
            <span className="font-black">UCAS IT CLUB</span>
          </ClubLink>
          <nav
            aria-label={ar ? "التنقل الرئيسي" : "Main navigation"}
            className="club-nav-bar hidden items-center gap-1 xl:flex"
          >
            {nav.map(([path, a, e]) => (
              <ClubLink
                key={path}
                path={path!}
                navigation
                className="club-nav-link rounded-full px-3 py-2 text-sm font-bold"
              >
                {ar ? a : e}
              </ClubLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <BrandButton
              variant="outline"
              size="sm"
              onClick={() => setLang(ar ? "en" : "ar")}
              aria-label={ar ? "Switch to English" : "التبديل للعربية"}
            >
              <Globe size={16} />
              {ar ? "EN" : "عربي"}
            </BrandButton>
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
                  className="club-nav-link block rounded-xl p-3 text-sm font-bold"
                >
                  {ar ? a : e}
                </ClubLink>
              </span>
            ))}
          </nav>
        )}
      </header>
      <main
        id="club-main"
        tabIndex={-1}
        className="mx-auto max-w-6xl px-4 py-12 sm:py-16 animate-stage-in"
      >
        {children}
      </main>
      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5 px-4">
          <p className="font-bold">
            {ar
              ? "النادي التكنولوجي — الكلية الجامعية للعلوم التطبيقية"
              : "University College of Applied Sciences"}
            <span className="block mt-1 text-sm text-muted-foreground">UCAS IT CLUB</span>
          </p>
          <div className="flex flex-wrap gap-4 text-sm font-bold">
            <ClubLink path="join" className="text-primary">
              {ar ? "انضم إلينا" : "Join us"}
            </ClubLink>
            <Link to="/" className="text-primary">
              {ar ? "اكتشف مسارك" : "Discover your path (Arabic)"}
            </Link>
            <ClubLink path="admin" className="text-muted-foreground">
              {ar ? "الإدارة" : "Admin"}
            </ClubLink>
            {(["facebook", "instagram", "linkedin", "github"] as const).map(
              (key) =>
                safeUrl(settings[key]) && (
                  <a
                    key={key}
                    href={safeUrl(settings[key])}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary capitalize"
                  >
                    {key}
                  </a>
                ),
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
function Card({ item, kind }: { item: Content; kind: ContentCollection }) {
  const { lang } = useClub();
  const title = local(item, "title", lang);
  const image = item.images?.map(safeUrl).find(Boolean);
  return (
    <article className="overflow-hidden rounded-3xl border border-border bg-card shadow-card transition-transform hover:-translate-y-1">
      {image ? (
        <img
          src={image}
          alt={title}
          loading="lazy"
          width={640}
          height={360}
          className={`w-full ${kind === "members" ? "aspect-square object-cover" : kind === "partners" ? "aspect-video object-contain p-6" : "aspect-video object-cover"}`}
        />
      ) : kind === "projects" ? (
        <div className="flex aspect-video flex-col items-center justify-center gap-3 bg-brand-gradient-soft text-muted-foreground">
          <ImageOff aria-hidden="true" size={32} />
          <span className="text-sm">
            {lang === "ar" ? "لم تُضف صورة للمشروع بعد" : "No project image added yet"}
          </span>
        </div>
      ) : null}
      <div className="p-6">
        {item.date && (
          <time dateTime={item.date} className="text-sm text-muted-foreground">
            {item.date}
          </time>
        )}
        <h2 className="mt-2 text-xl font-extrabold">{title}</h2>
        <p className="mt-3 line-clamp-3 text-base leading-relaxed text-muted-foreground">
          {local(item, "description", lang)}
        </p>
        {kind === "partners" ? (
          <>
            {item.partnershipType && (
              <p className="mt-3 font-bold text-primary">{local(item, "partnershipType", lang)}</p>
            )}
            {safeUrl(item.websiteUrl) && (
              <a
                href={safeUrl(item.websiteUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-primary font-bold"
              >
                {lang === "ar" ? "موقع الشريك" : "Visit partner"}
                <ExternalLink size={16} />
              </a>
            )}
          </>
        ) : (
          <ClubLink
            path={`${kind}/${item.id}`}
            className="mt-5 inline-flex items-center gap-2 text-primary font-bold"
          >
            {lang === "ar" ? "التفاصيل" : "View details"}
            {lang === "ar" ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
          </ClubLink>
        )}
      </div>
    </article>
  );
}
function Grid({ items, kind }: { items: Content[]; kind: ContentCollection }) {
  return items.length ? (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Card key={item.id} item={item} kind={kind} />
      ))}
    </div>
  ) : (
    <Empty />
  );
}
function Home() {
  const { lang, data } = useClub();
  const ar = lang === "ar";
  return (
    <>
      <section className="mx-auto max-w-4xl text-center">
        <img
          src={logo}
          alt="UCAS IT CLUB"
          width={124}
          height={160}
          className="mx-auto h-40 w-32 object-contain animate-float-slow"
        />
        <p className="mt-7 text-primary font-bold">
          {ar ? "النادي التكنولوجي" : "Technology Club"}
          <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
            {ar ? "الكلية الجامعية للعلوم التطبيقية" : "University College of Applied Sciences"}
          </span>
        </p>
        <h1 className="mt-4 text-4xl font-black leading-tight sm:text-6xl text-gradient-brand">
          {ar ? "نتعلم نبتكر نتقدم" : "Learn, innovate, advance"}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-loose text-muted-foreground">
          {ar
            ? "مجتمع طلابي يجمع المهتمين بالتقنية. تعرّف على مشاريع النادي وفريقه وفعالياته، وكن جزءًا من التجربة."
            : "A student community for technology enthusiasts. Explore our projects, meet the team, and take part in club activities."}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ClubLink
            path="join"
            className={
              linkClass +
              " bg-brand-gradient text-primary-foreground border-transparent shadow-glow-blue"
            }
          >
            {ar ? "انضم إلينا" : "Join the club"}
          </ClubLink>
          <ClubLink path="projects">{ar ? "استكشف المشاريع" : "Explore projects"}</ClubLink>
        </div>
      </section>
      <div className="my-14 grid grid-cols-3 gap-3">
        {(
          [
            [Users, data.members.length, ar ? "الأعضاء" : "Members"],
            [FolderOpen, data.projects.length, ar ? "المشاريع" : "Projects"],
            [
              CalendarDays,
              data.events.filter((x) => x.status === "past").length,
              ar ? "فعاليات منفذة" : "Past events",
            ],
          ] as const
        ).map(([Icon, n, label]) => (
          <div
            key={label}
            className="rounded-3xl border border-border bg-card p-5 text-center shadow-card"
          >
            <Icon className="mx-auto text-primary" />
            <strong className="my-2 block text-3xl font-black">{n}</strong>
            <span className="text-sm font-bold text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
      <section>
        <h2 className="mb-6 text-2xl font-black">{ar ? "أحدث المشاريع" : "Latest projects"}</h2>
        <Grid items={data.projects.slice(0, 3)} kind="projects" />
      </section>
      <section className="mt-14">
        <h2 className="mb-6 text-2xl font-black">{ar ? "من أخبار النادي" : "Club news"}</h2>
        <Grid items={data.events.slice(0, 1)} kind="events" />
      </section>
      <section className="mt-14 rounded-[2rem] bg-brand-gradient-soft p-8 text-center">
        <Gamepad2 className="mx-auto h-10 w-10 text-primary" />
        <h2 className="mt-4 text-2xl font-black">
          {ar ? "مش عارف أي تخصص يناسبك؟" : "Which technology path fits you?"}
        </h2>
        <p className="mt-3 text-muted-foreground">
          {ar
            ? "اكتشف ميولك عبر رحلة من سبعة مواقف تقنية."
            : "Explore your interests in seven technology scenarios. The game is currently in Arabic."}
        </p>
        <Link to="/" className={linkClass + " mt-6"}>
          {ar ? "ابدأ رحلة اكتشاف مسارك" : "Open the pathfinder game"}
        </Link>
      </section>
    </>
  );
}
function About() {
  const { lang, settings, setupRequired } = useClub();
  const ar = lang === "ar";
  return (
    <>
      <Heading ar="من نحن" en="About the club" />
      <div className="grid gap-6 sm:grid-cols-2">
        {(["vision", "mission"] as const).map((key) => (
          <article key={key} className="rounded-3xl border border-border bg-card p-8 shadow-card">
            <h2 className="text-2xl font-black text-primary">
              {key === "vision" ? (ar ? "رؤيتنا" : "Our vision") : ar ? "رسالتنا" : "Our mission"}
            </h2>
            <p className="mt-4 whitespace-pre-line text-base leading-loose text-muted-foreground">
              {settings[ar ? key : (`${key}_en` as "vision_en" | "mission_en")] ||
                (ar
                  ? "سيُنشر النص الرسمي المعتمد قريبًا."
                  : "The approved official statement will be published here.")}
            </p>
          </article>
        ))}
      </div>
      <h2 className="mt-12 mb-6 text-2xl font-black">{ar ? "أهدافنا" : "Our goals"}</h2>
      {settings[ar ? "goals" : "goals_en"] ? (
        <ol className="grid gap-4 sm:grid-cols-2">
          {settings[ar ? "goals" : "goals_en"]
            .split("\n")
            .filter(Boolean)
            .map((goal, i) => (
              <li key={i} className="rounded-3xl bg-brand-gradient-soft p-6">
                <strong className="text-primary">{i + 1}. </strong>
                {goal}
              </li>
            ))}
        </ol>
      ) : (
        <Empty />
      )}
      <h2 className="mt-12 mb-6 text-2xl font-black">{ar ? "مجالات عملنا" : "Our fields"}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map(([key, a, e], i) => {
          const Icon = [Smartphone, Globe, Gamepad2, Palette][i]!;
          return (
            <div key={key} className="rounded-3xl border border-border bg-card p-6">
              <Icon className="h-9 w-9 text-primary" />
              <h3 className="mt-4 font-extrabold">{ar ? a : e}</h3>
            </div>
          );
        })}
      </div>
    </>
  );
}
function Listing({ kind }: { kind: ContentCollection }) {
  const { lang, data } = useClub();
  const ar = lang === "ar";
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [year, setYear] = useState("all");
  const [status, setStatus] = useState("all");
  let items = data[kind].filter(
    (x) =>
      (!search ||
        `${x.title} ${x.title_en} ${x.description} ${x.description_en}`
          .toLowerCase()
          .includes(search.toLowerCase())) &&
      (category === "all" || x.category === category) &&
      (year === "all" || String(x.year) === year) &&
      (status === "all" || x.status === status),
  );
  if (kind === "events" || kind === "achievements")
    items = [...items].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  return (
    <>
      <Heading ar={labels[kind][0]} en={labels[kind][1]} />
      {kind === "projects" && (
        <div className="mb-8 grid gap-3 sm:grid-cols-3">
          <Input
            aria-label={ar ? "ابحث في المشاريع" : "Search projects"}
            placeholder={ar ? "ابحث في المشاريع…" : "Search projects…"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select dir={ar ? "rtl" : "ltr"} value={category} onValueChange={setCategory}>
            <SelectTrigger aria-label={ar ? "المجال" : "Category"}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{ar ? "كل المجالات" : "All categories"}</SelectItem>
              {categories.map(([key, a, e]) => (
                <SelectItem key={key} value={key}>
                  {ar ? a : e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select dir={ar ? "rtl" : "ltr"} value={year} onValueChange={setYear}>
            <SelectTrigger aria-label={ar ? "السنة" : "Year"}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{ar ? "كل السنوات" : "All years"}</SelectItem>
              {Array.from(new Set(data.projects.map((x) => x.year).filter(Boolean)))
                .sort()
                .reverse()
                .map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      )}
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
          <Grid kind={kind} items={items.filter((x) => x.isFounder)} />
          {committees.map(([key, a, e]) => (
            <section key={key} className="mt-10">
              <h2 className="mb-5 text-xl font-black text-primary">{ar ? a : e}</h2>
              <Grid kind={kind} items={items.filter((x) => !x.isFounder && x.committee === key)} />
            </section>
          ))}
        </>
      ) : kind === "achievements" ? (
        items.length ? (
          <ol className="space-y-8 border-s-2 border-primary/25 ps-6">
            {items.map((item) => (
              <li key={item.id}>
                <Card item={item} kind={kind} />
              </li>
            ))}
          </ol>
        ) : (
          <Empty />
        )
      ) : (
        <Grid items={items} kind={kind} />
      )}
    </>
  );
}
function Detail({ kind, id }: { kind: ContentCollection; id: string }) {
  const { data, lang } = useClub();
  const item = data[kind].find((x) => x.id === id);
  const ar = lang === "ar";
  if (!item)
    return (
      <>
        <Heading ar="المحتوى غير موجود" en="Content not found" />
        <ClubLink path={kind}>{ar ? "العودة للقائمة" : "Back to list"}</ClubLink>
      </>
    );
  const people =
    kind === "projects" ? data.members.filter((m) => item.memberIds?.includes(m.id)) : [];
  const projects = kind === "members" ? data.projects.filter((p) => p.memberIds?.includes(id)) : [];
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
        <div className="mt-6 flex flex-wrap gap-2">
          {item.technologies?.map((x) => (
            <span key={x} className="rounded-full bg-brand-gradient-soft px-4 py-2 text-primary">
              {x}
            </span>
          ))}
        </div>
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
              ["demoUrl", ar ? "عرض المشروع" : "Demo"],
              ["apkUrl", "APK"],
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
      {people.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-5 text-2xl font-black">{ar ? "فريق المشروع" : "Project team"}</h2>
          <Grid items={people} kind="members" />
        </section>
      )}
      {kind === "members" && (
        <section className="mt-10">
          <h2 className="mb-5 text-2xl font-black">{ar ? "المشاريع" : "Projects"}</h2>
          <Grid items={projects} kind="projects" />
        </section>
      )}
      <div className="mt-8">
        <ClubLink path={kind}>{ar ? "العودة للقائمة" : "Back to list"}</ClubLink>
      </div>
    </>
  );
}
function PublicForm({ join }: { join: boolean }) {
  const { lang, settings, setupRequired } = useClub();
  const ar = lang === "ar";
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [major, setMajor] = useState("");
  const [committee, setCommittee] = useState<string>(committees[0][0]);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const form = e.currentTarget;
    const values = Object.fromEntries(new FormData(form)) as Record<string, string>;
    if (join) {
      values["preferredCommittee"] = committee;
      values["major"] = major;
    }
    const parsed = (join ? joinSchema : contactSchema).safeParse(values);
    if (!parsed.success) {
      setMessage(
        ar
          ? "تحقق من الحقول: بريد صحيح ورسالة لا تقل عن 10 أحرف."
          : "Check your fields: use a valid email and a message of at least 10 characters.",
      );
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      await submitForm(join ? "joinRequests" : "contactMessages", parsed.data);
      setSuccess(true);
      form.reset();
    } catch {
      setMessage(
        ar
          ? "لم يتم الإرسال. حاول مجددًا لاحقًا."
          : "Your message was not sent. Please try again later.",
      );
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
        {success ? (
          <div
            role="status"
            className="rounded-2xl bg-brand-gradient-soft p-6 text-primary font-bold"
          >
            {ar
              ? "وصل طلبك بنجاح. شكرًا لتواصلك معنا."
              : "Your submission has been received. Thank you for getting in touch."}
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            {fields.map(([name, a, en, type]) => (
              <label key={name} className="block text-sm font-bold">
                <span className="mb-2 block">{ar ? a : en}</span>
                <Input
                  name={name!}
                  type={type!}
                  required={name !== "phone"}
                  maxLength={name === "studentId" ? 9 : name === "email" ? 254 : 200}
                  minLength={name === "studentId" ? 9 : undefined}
                  inputMode={name === "studentId" ? "numeric" : undefined}
                  pattern={name === "studentId" ? "[0-9]{9}" : undefined}
                  title={
                    name === "studentId"
                      ? ar
                        ? "أدخل الرقم الجامعي المكوّن من 9 أرقام"
                        : "Enter a 9-digit student ID"
                      : undefined
                  }
                  onInput={
                    name === "studentId"
                      ? (e) => {
                          e.currentTarget.value = e.currentTarget.value
                            .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632))
                            .replace(/[^0-9]/g, "")
                            .slice(0, 9);
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
                        {name}
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
            {(!configured || setupRequired) && (
              <p role="status" className="text-sm text-muted-foreground">
                {ar
                  ? "استقبال الطلبات غير متاح حاليًا. يُرجى العودة لاحقًا."
                  : "Submissions are currently unavailable. Please check back later."}
              </p>
            )}
            {message && (
              <p role="alert" className="text-primary">
                {message}
              </p>
            )}
            <BrandButton type="submit" disabled={busy || !configured || setupRequired}>
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
function ContentPage() {
  const { loading, error, lang } = useClub();
  const path = useLocation()
    .pathname.replace(/^\/club\/?/, "")
    .replace(/\/$/, "");
  const [page, id] = path.split("/");
  if (page === "admin") return <AdminPanel />;
  if (loading)
    return (
      <p role="status" className="py-20 text-center">
        {lang === "ar" ? "جارٍ تحميل المحتوى…" : "Loading content…"}
      </p>
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
  if (page === "join" || page === "contact")
    return <PublicForm key={page} join={page === "join"} />;
  if (collections.includes(page as ContentCollection))
    return id ? (
      <Detail kind={page as ContentCollection} id={id} />
    ) : (
      <Listing key={page} kind={page as ContentCollection} />
    );
  return <Heading ar="الصفحة غير موجودة" en="Page not found" />;
}
export function ClubSite() {
  return (
    <ClubProvider>
      <Shell>
        <ContentPage />
      </Shell>
    </ClubProvider>
  );
}
