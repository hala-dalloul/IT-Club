import type { Content, ContentCollection, Lang } from "./model";

/**
 * Every public URL, in one place.
 *
 * Arabic lives at the root and English under /en, so each language has its
 * own address for search engines; the URL alone decides the language. Pages
 * are named by what visitors see: the members collection is /team.
 *
 * Inside the app a page is its "page path" without the language: "",
 * "about", "members", "news/<slug>". These helpers turn one into the other.
 */

/** URL segment for each page whose URL name differs from its internal name. */
const segments: Record<string, string> = { members: "team" };
const pages: Record<string, string> = { team: "members" };

export function langOf(pathname: string): Lang {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "ar";
}

/** The page path of a URL: "/en/team/x" → "members/x". */
export function pageOf(pathname: string): string {
  const rest = pathname.replace(/^\/en(?=\/|$)/, "").replace(/^\/+|\/+$/g, "");
  const [first = "", ...tail] = rest.split("/");

  return [pages[first] ?? first, ...tail].filter(Boolean).join("/");
}

/** The URL of a page path in a language: ("en", "members") → "/en/team". */
export function hrefOf(lang: Lang, page: string): string {
  const [first = "", ...tail] = page.split("/").filter(Boolean);
  const path = [segments[first] ?? first, ...tail].filter(Boolean).join("/");
  const prefix = lang === "en" ? "/en" : "";

  return path ? `${prefix}/${path}` : prefix || "/";
}

/** Readable name when the item has one, its id otherwise. */
export function itemPage(kind: ContentCollection, item: Pick<Content, "id" | "slug">) {
  return `${kind}/${item.slug || item.id}`;
}

/** The same page in the other language. */
export function otherLangHref(pathname: string): string {
  const lang = langOf(pathname);

  return hrefOf(lang === "ar" ? "en" : "ar", pageOf(pathname));
}
