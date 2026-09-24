import { createFileRoute, notFound } from "@tanstack/react-router";
import { ClubSite } from "@/components/club/ClubSite";
import { collections, type Content, type ContentCollection } from "@/lib/club/model";
import { loadClubData, refreshClubData } from "@/lib/club/ssr-data";

const titles = {
  about: "من نحن | About",
  members: "الفريق | Team",
  events: "الفعاليات | Events",
  news: "الأخبار | News",
  partners: "الشراكات | Partners",
  join: "انضم إلينا | Join",
  contact: "تواصل معنا | Contact",
  privacy: "الخصوصية | Privacy",
  admin: "الإدارة | Admin",
} satisfies Record<string, string>;

function titleFor(section: string | undefined): string {
  if (section && Object.hasOwn(titles, section)) {
    // SAFETY: hasOwn above confirms section is one of titles' known keys.
    return titles[section as keyof typeof titles];
  }

  return "UCAS";
}

/** Pages that take no id after them. */
const pages = ["about", "join", "contact", "privacy", "admin"];

const isCollection = (page: string): page is ContentCollection =>
  // SAFETY: the cast only satisfies includes' parameter type; the check itself
  // is a plain string comparison.
  collections.includes(page as ContentCollection);

/**
 * What a splat points at, or undefined when nothing lives there.
 *
 * ClubSite renders any unknown path as a "not found" heading, which used to go
 * out as 200 — search engines index those as real pages. Anything this rejects
 * now answers 404.
 */
function target(splat: string): { kind?: ContentCollection; id?: string | undefined } | undefined {
  const [page = "", id, ...rest] = splat.replace(/\/$/, "").split("/");

  if (rest.length) return undefined;
  if (pages.includes(page)) return id === undefined ? {} : undefined;
  if (isCollection(page)) return { kind: page, id };

  return undefined;
}

/** Mirrors Detail, which still opens news and events links across the two kinds. */
function has(data: Record<ContentCollection, Content[]>, kind: ContentCollection, id: string) {
  const kinds: ContentCollection[] =
    kind === "news" ? ["news", "events"] : kind === "events" ? ["events", "news"] : [kind];

  return kinds.some((k) => data[k].some((item) => item.id === id));
}

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const Route = createFileRoute("/club/$")({
  head: ({ params, match }) => {
    const missing = match.status === "notFound";

    return {
      meta: [
        {
          title: `${missing ? "الصفحة غير موجودة | Page not found" : titleFor(params._splat?.split("/")[0])} — UCAS IT CLUB`,
        },
        {
          name: "description",
          content: "تعرّف على مجتمع نادي تكنولوجيا المعلومات وأنشطته في UCAS.",
        },
        ...(missing || params._splat?.startsWith("admin")
          ? [{ name: "robots", content: "noindex,nofollow" }]
          : []),
      ],
    };
  },
  loader: async ({ context, params }) => {
    // Loaded even for a path that will 404: Shell hides the footer until data arrives.
    const loaded = await loadClubData(context.queryClient);
    const found = target(params._splat ?? "");

    if (!found) throw notFound();

    const { kind, id } = found;

    // Without data (not configured, or Supabase down) nothing is known to be
    // missing; the page renders its own error state instead.
    if (!kind || !id || !loaded || has(loaded.data, kind, id)) return;

    // Every item id is a UUID, so anything else is missing without asking.
    if (!uuid.test(id)) throw notFound();

    // ponytail: each unknown UUID costs one full payload fetch. Fine at this
    // traffic; if bots start guessing ids, check the one id with a
    // `club_content?select=id&id=eq.<id>` read instead.
    const fresh = await refreshClubData(context.queryClient);

    if (fresh && !has(fresh.data, kind, id)) throw notFound();
  },
  component: ClubSite,
  notFoundComponent: () => <ClubSite notFound />,
});
