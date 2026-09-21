import { Link } from "@tanstack/react-router";
import { Plus, ArrowUpRight, Linkedin, Github } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { safeUrl, type Content, type Lang } from "@/lib/club/model";
import logo from "@/assets/ucas-logo.png";

/** Team cards and an accessible detail drawer, adapted to the club's content model. */
export default function InformationDrawer({ teams, lang }: { teams: Content[]; lang: Lang }) {
  const ar = lang === "ar";
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
      {teams.map((member, index) => {
        const name = ar ? member.title : member.title_en || member.title;
        const description = ar ? member.description : member.description_en || member.description;
        const role = ar ? member.role : member.role_en || member.role;
        const photo = member.images?.map(safeUrl).find(Boolean);
        const image = photo || logo;
        // The club logo stands in for a missing photo; inset it so it reads as a
        // placeholder mark rather than a cropped portrait.
        const fit = photo ? "object-cover object-top" : "object-contain p-4";
        return (
          <Sheet key={member.id}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label={ar ? `عرض معلومات ${name}` : `View ${name}`}
                className="group relative aspect-[3/4] w-full min-w-0 justify-self-center lg:w-[95%] overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-card text-start shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <img
                  src={image}
                  alt=""
                  width={450}
                  height={600}
                  loading="lazy"
                  className={`h-full w-full ${fit} transition duration-300 group-hover:grayscale motion-reduce:transition-none`}
                />
                <span className="absolute end-2 top-2 rounded-full bg-black/40 p-1.5 sm:end-3 sm:top-3 sm:p-2 text-white">
                  <Plus size={18} />
                </span>
                <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 sm:gap-2 bg-black/60 p-2 sm:p-3 lg:p-5 text-white backdrop-blur-md transition-transform duration-300 lg:translate-y-full lg:group-hover:translate-y-0 lg:group-focus-visible:translate-y-0 motion-reduce:transition-none">
                  <span className="min-w-0">
                    <span className="block truncate text-sm sm:text-base lg:text-xl font-bold">
                      {name}
                    </span>
                    <span className="mt-1 block truncate text-xs sm:text-sm">
                      {role || description}
                    </span>
                  </span>
                  <ArrowUpRight className="hidden shrink-0 sm:block" size={22} />
                </span>
              </button>
            </SheetTrigger>
            <SheetContent
              dir={ar ? "rtl" : "ltr"}
              side={ar ? "right" : "left"}
              className="w-full overflow-y-auto px-6 pb-10 pt-16 sm:max-w-none md:w-[70vw] lg:w-[60vw] motion-reduce:animate-none motion-reduce:transition-none"
            >
              <div className="mb-6 border-b border-border pb-4 text-sm text-muted-foreground">
                {index + 1} / {teams.length}
              </div>
              <div className="grid items-start gap-6 md:grid-cols-2">
                <img
                  src={image}
                  alt={name}
                  width={450}
                  height={600}
                  className="aspect-[3/4] w-full rounded-2xl object-cover object-top"
                />
                <div className="min-w-0">
                  <SheetTitle className="break-words text-3xl font-black leading-relaxed">
                    {name}
                  </SheetTitle>
                  <SheetDescription className="mt-3 text-base">
                    {role || (ar ? "عضو النادي التكنولوجي" : "Technology Club member")}
                  </SheetDescription>
                </div>
              </div>
              <p className="my-8 whitespace-pre-line break-words text-base leading-loose">
                {description}
              </p>
              <div className="flex flex-wrap items-center gap-5">
                <Link
                  to="/club/$"
                  params={{ _splat: `members/${member.id}` }}
                  className="rounded-full bg-brand-gradient px-5 py-3 font-bold text-white"
                >
                  {ar ? "صفحة العضو" : "Member profile"}
                </Link>
                {safeUrl(member.githubUrl) && (
                  <a
                    href={safeUrl(member.githubUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={ar ? `ملف ${name} على GitHub` : `${name} on GitHub`}
                    className="inline-flex items-center gap-2 font-bold text-primary"
                  >
                    <Github size={20} />
                    GitHub
                  </a>
                )}
                {safeUrl(member.linkedinUrl) && (
                  <a
                    href={safeUrl(member.linkedinUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-bold text-primary"
                  >
                    <Linkedin size={20} />
                    LinkedIn
                  </a>
                )}
              </div>
              {member.images
                ?.slice(1)
                .map(safeUrl)
                .filter(Boolean)
                .map((src, i) => (
                  <img
                    key={`${src}-${i}`}
                    src={src}
                    alt={name}
                    loading="lazy"
                    className="mt-8 max-h-[70vh] w-full rounded-2xl object-contain"
                  />
                ))}
            </SheetContent>
          </Sheet>
        );
      })}
    </div>
  );
}
