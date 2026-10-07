import { CalendarDays, UserRound } from "lucide-react";
import { local, safeUrl, type Content, type Lang } from "@/lib/club/model";
import { siteName } from "@/lib/club/seo";
import { ClubLink } from "./ClubContent";
import { ContentImage } from "./ContentImage";
import { RichText } from "./RichText";

function formattedNewsDate(date: string, lang: Lang) {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;

  return new Intl.DateTimeFormat(lang === "ar" ? "ar-PS" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

export function NewsDetail({ news, lang }: { news: Content; lang: Lang }) {
  const ar = lang === "ar";
  const title = local(news, "title", lang);
  const validImages = news.images?.filter((image) => safeUrl(image)) ?? [];
  const cover = validImages[0];

  return (
    <article className="flow-root overflow-hidden rounded-[2rem] border border-border bg-card p-5 shadow-card sm:p-8 lg:p-10">
      <figure className="mb-6 overflow-hidden rounded-3xl border border-border bg-muted lg:float-right lg:mb-4 lg:ml-8 lg:w-[48%]">
        {cover ? (
          <img
            src={cover}
            alt={title}
            width={1200}
            height={675}
            className="aspect-video w-full object-cover"
          />
        ) : (
          <>
            <ContentImage alt={title} lang={lang} className="aspect-video w-full object-cover" />
            <figcaption className="px-4 py-3 text-xs leading-relaxed text-muted-foreground">
              {ar
                ? "صورة تعريفية للنادي — تُضاف صورة الخبر عند توفرها."
                : "Club illustration — the news image will be added when available."}
            </figcaption>
          </>
        )}
      </figure>

      <h1 className="text-xl font-black text-gradient-brand sm:text-3xl">{title}</h1>

      <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm font-bold text-muted-foreground">
        {news.date && (
          <time dateTime={news.date} className="flex items-center gap-2">
            <CalendarDays className="size-4 text-primary" aria-hidden="true" />
            {formattedNewsDate(news.date, lang)}
          </time>
        )}
        <p className="flex items-center gap-2">
          <UserRound className="size-4 text-primary" aria-hidden="true" />
          <span>{ar ? "بواسطة" : "By"}</span>
          <ClubLink path="about" className="text-primary underline underline-offset-4">
            {siteName[lang]}
          </ClubLink>
        </p>
      </div>

      <RichText
        value={local(news, "description", lang)}
        className="mt-5 text-base leading-loose text-muted-foreground"
      />

      {validImages.length > 1 && (
        <section
          className="clear-both mt-10 border-t border-border pt-8"
          aria-label={ar ? "صور الخبر" : "News photos"}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {validImages.slice(1).map((url, index) => (
              <img
                key={url}
                src={url}
                alt={`${title} — ${index + 2}`}
                width={800}
                height={450}
                loading="lazy"
                className="aspect-video w-full rounded-2xl object-cover"
              />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
