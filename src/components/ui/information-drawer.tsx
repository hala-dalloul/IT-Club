import { Plus, Linkedin, Github } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { committees, safeUrl, type Content, type Lang } from "@/lib/club/model";
import logo from "@/assets/ucas-logo.webp";
import { RichText } from "@/components/club/RichText";
import { plainRichText } from "@/lib/club/rich-text";

/** Team cards and an accessible detail drawer, adapted to the club's content model. */
export default function InformationDrawer({ teams, lang }: { teams: Content[]; lang: Lang }) {
  const ar = lang === "ar";
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
      {teams.map((member, index) => {
        const name = ar ? member.title : member.title_en || member.title;
        const description = ar ? member.description : member.description_en || member.description;
        const role = ar ? member.role : member.role_en || member.role;
        const photo = member.images?.map(safeUrl).find(Boolean);
        const image = photo || logo;
        const detailImageFit = photo ? "object-cover object-top" : "object-contain p-4";
        const committee = committees.find(([key]) => key === member.committee);
        const committeeName = committee ? (ar ? committee[1] : committee[2]) : "";
        return (
          <Sheet key={member.id}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label={ar ? `عرض معلومات ${name}` : `View ${name}`}
                className="group flex h-full w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card text-start shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:rounded-3xl"
              >
                <span className="relative block aspect-[4/4.3] w-full overflow-hidden bg-brand-gradient-soft">
                  <img
                    src={image}
                    alt=""
                    width={450}
                    height={600}
                    loading="lazy"
                    className={`h-full w-full transition duration-500 group-hover:scale-105 motion-reduce:transition-none ${photo ? "object-cover object-top" : "object-contain p-8"}`}
                  />
                  <span className="absolute end-2 top-2 rounded-full border border-white/40 bg-background/90 p-2 text-primary shadow-sm sm:end-3 sm:top-3">
                    <Plus size={17} />
                  </span>
                </span>
                <span className="flex min-h-24 flex-1 flex-col justify-center p-3 sm:min-h-28 sm:p-4">
                  <span className="truncate text-sm font-black leading-snug sm:text-base">{name}</span>
                  <span className="mt-1.5 line-clamp-1 text-xs font-medium text-muted-foreground sm:text-sm">
                    {role || plainRichText(description)}
                  </span>
                  {committeeName && (
                    <span className="mt-3 w-fit max-w-full truncate rounded-full bg-brand-gradient-soft px-2.5 py-1 text-[10px] font-bold text-primary sm:text-xs">
                      {committeeName}
                    </span>
                  )}
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
              <div className="grid grid-cols-[128px_minmax(0,1fr)] items-start gap-4 sm:grid-cols-[184px_minmax(0,1fr)] sm:gap-6 lg:grid-cols-[232px_minmax(0,1fr)]">
                <img
                  src={image}
                  alt={name}
                  width={450}
                  height={600}
                  className={`aspect-[3/4] w-full max-w-[232px] rounded-2xl ${detailImageFit}`}
                />
                <div className="min-w-0">
                  <SheetTitle className="break-words text-2xl font-black leading-relaxed sm:text-3xl">
                    {name}
                  </SheetTitle>
                  <SheetDescription className="mt-3 text-base">
                    {role || (ar ? "عضو النادي التكنولوجي" : "UCAS IT Club member")}
                  </SheetDescription>
                  <RichText value={description} className="mt-5 text-base leading-loose" />
                  <div className="mt-6 flex flex-wrap items-center gap-5">
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
                </div>
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
