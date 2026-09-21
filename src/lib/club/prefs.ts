import { createIsomorphicFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import type { Lang } from "./model";

export const LANG_COOKIE = "ucas-language";
export const THEME_COOKIE = "ucas-theme";

export type Theme = "dark" | "light";

const normalise = (value: string | undefined | ""): Lang => (value === "en" ? "en" : "ar");

function readCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}

/**
 * The visitor's language, readable during SSR as well as in the browser.
 *
 * Language used to live only in localStorage, which the server cannot see, so
 * every render started in Arabic and the client flipped it after hydration —
 * an English visitor watched the whole chrome switch under them on each load.
 * A cookie is sent with the document request, so both sides agree on the first
 * paint.
 */
export const readLang = createIsomorphicFn()
  .server((): Lang => normalise(getCookie(LANG_COOKIE)))
  .client((): Lang => normalise(readCookie(LANG_COOKIE)));

/**
 * The visitor's theme, on the same footing as the language.
 *
 * An inline script in the document head already applies the `dark` class
 * before first paint, but React's own state started at light and corrected
 * itself after hydration, so the toggle's icon visibly swapped on every load.
 */
export const readTheme = createIsomorphicFn()
  .server((): Theme => (getCookie(THEME_COOKIE) === "dark" ? "dark" : "light"))
  .client((): Theme => (readCookie(THEME_COOKIE) === "dark" ? "dark" : "light"));

/** Persist a preference where both the browser and the server can read it. */
export function writePrefCookie(name: string, value: string) {
  // A year, readable by the server, not sent on cross-site requests.
  document.cookie = `${name}=${value}; path=/; max-age=31536000; samesite=lax`;
}
