import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { lazy, Suspense, useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import cairoArabic from "../assets/fonts/cairo-arabic.woff2?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { readLang, readTheme } from "../lib/club/prefs";
import { pages, seo, siteName, titleFor } from "../lib/club/seo";

// Lazy so the site's chunk stays out of the entry bundle; the club routes
// already load it on their own.
const ClubSite = lazy(() =>
  import("@/components/club/ClubSite").then((m) => ({ default: m.ClubSite })),
);

// The club's own chrome and language, not a bare English page.
const NotFoundComponent = () => (
  <Suspense>
    <ClubSite notFound />
  </Suspense>
);

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: ({ match }) => {
    const lang = readLang();
    // Only unmatched URLs end here; every page route sets its own tags on top.
    const page = match.globalNotFound ? "missing" : "home";

    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "author", content: siteName[lang] },
        ...seo({
          lang,
          title: titleFor(page, lang),
          description: pages[page][lang].description,
          path: "/",
          noindex: Boolean(match.globalNotFound),
        }),
      ],
      links: [
        {
          rel: "stylesheet",
          href: appCss,
        },
        // Cairo, self-hosted: the same face the club already uses, without a
        // render-blocking stylesheet on a third-party origin. Both cuts are
        // variable, so one file per script covers every weight.
        {
          rel: "preload",
          as: "font",
          type: "font/woff2",
          href: cairoArabic,
          crossOrigin: "anonymous",
        },
        { rel: "icon", href: "/favicon.png", type: "image/png" },
      ],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  // Matches what ClubProvider seeds its state with, so the document ships in
  // the visitor's language instead of flipping after hydration.
  const lang = readLang();
  const theme = readTheme();

  return (
    <html
      lang={lang}
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={theme === "dark" ? "dark" : undefined}
      style={{ colorScheme: theme }}
      suppressHydrationWarning
    >
      <head>
        {/* Covers visitors whose preference predates the cookie: apply their
            stored theme before first paint and seed the cookie so the next
            document is server-rendered with it. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){document.documentElement.classList.add('js');try{var theme=localStorage.getItem('ucas-theme');if(!theme)return;var dark=theme==='dark';document.documentElement.classList.toggle('dark',dark);document.documentElement.style.colorScheme=dark?'dark':'light';document.cookie='ucas-theme='+(dark?'dark':'light')+'; path=/; max-age=31536000; samesite=lax';}catch(e){}})();`,
          }}
        />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
