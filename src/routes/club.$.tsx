import { createFileRoute, notFound } from "@tanstack/react-router";
import { ContentPage, Missing } from "@/components/club/ClubSite";
import {
  collections,
  isEmptySection,
  type Content,
  type ContentCollection,
} from "@/lib/club/model";
import { readLang } from "@/lib/club/prefs";
import { itemSeo, pages as copy, seo, titleFor, type PageKey } from "@/lib/club/seo";
import { contentExists } from "@/lib/club/public-api";
import { loadClubData, refreshClubData } from "@/lib/club/ssr-data";

/** Pages that take no id after them. */
const pages = ["about", "join", "contact", "privacy", "admin"];

const isCollection = (page: string): page is ContentCollection =>
  // SAFETY: the cast only satisfies includes' parameter type; the check itself
  // is a plain string comparison.
  collections.includes(page as ContentCollection);

/**
 * What a splat points at, or undefined when nothing lives there.
 *
 * ContentPage renders any unknown path as a "not found" heading, which used to go
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
const kindsFor = (kind: ContentCollection): ContentCollection[] =>
  kind === "news" ? ["news", "events"] : kind === "events" ? ["events", "news"] : [kind];

function find(data: Record<ContentCollection, Content[]>, kind: ContentCollection, id: string) {
  for (const k of kindsFor(kind)) {
    const item = data[k].find((x) => x.id === id);

    if (item) return item;
  }

  return undefined;
}

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const Route = createFileRoute("/club/$")({
  // Before head: the router infers head's loaderData from it, in object order.
  loader: async ({ context, params }): Promise<{ item?: Content }> => {
    // The root loader already warmed this; the call just hands back the data.
    const loaded = await loadClubData(context.queryClient);
    const found = target(params._splat ?? "");

    if (!found) throw notFound();

    const { kind, id } = found;

    // Without data (not configured, or Supabase down) nothing is known to be
    // missing; the page renders its own error state instead.
    if (!kind || !loaded) return {};

    if (!id) {
      // ponytail: a first item added to an empty section can still 404 for up
      // to the one-minute cache. Refreshing here instead would re-fetch on
      // every visit while the section stays empty.
      if (isEmptySection(kind, loaded.data)) throw notFound();

      return {};
    }

    const item = find(loaded.data, kind, id);

    if (item) return { item };

    // Every item id is a UUID, so anything else is missing without asking.
    if (!uuid.test(id)) throw notFound();

    // The cached payload is up to a minute old, so ask about this one id
    // before calling it missing. A made-up or deleted id costs one tiny read;
    // only an item published in the last minute re-fetches the full payload.
    const exists = await contentExists(id, kindsFor(kind)).catch(() => undefined);

    if (exists === false) throw notFound();

    // Unknown (the check failed): render and let the page show its own state.
    if (exists === undefined) return {};

    const fresh = await refreshClubData(context.queryClient);

    if (!fresh) return {};

    const late = find(fresh.data, kind, id);

    if (!late) throw notFound();

    return { item: late };
  },
  head: ({ params, match, loaderData }) => {
    const lang = readLang();
    const splat = params._splat ?? "";
    const path = `/club/${splat}`;
    const page = splat.split("/")[0] ?? "";

    if (match.status !== "notFound" && loaderData?.item)
      // Individual member pages stay out of search: they carry students' names and photos.
      return { meta: itemSeo(loaderData.item, lang, path, page === "members") };

    // SAFETY: hasOwn confirms page is one of copy's keys before the cast.
    const key: PageKey =
      match.status === "notFound" || !Object.hasOwn(copy, page) ? "missing" : (page as PageKey);

    return {
      meta: seo({
        lang,
        title: titleFor(key, lang),
        description: copy[key][lang].description,
        path,
        noindex: key === "missing" || key === "admin",
      }),
    };
  },
  component: ContentPage,
  notFoundComponent: Missing,
});
