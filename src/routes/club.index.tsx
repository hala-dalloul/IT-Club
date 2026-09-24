import { createFileRoute } from "@tanstack/react-router";
import { ClubSite } from "@/components/club/ClubSite";
import { readLang } from "@/lib/club/prefs";
import { pages, seo, titleFor } from "@/lib/club/seo";
import { loadClubData } from "@/lib/club/ssr-data";

export const Route = createFileRoute("/club/")({
  head: () => {
    const lang = readLang();

    // /club renders the same page, so both point share previews at "/".
    return {
      meta: seo({
        lang,
        title: titleFor("home", lang),
        description: pages.home[lang].description,
        path: "/",
      }),
    };
  },
  loader: ({ context }) => loadClubData(context.queryClient),
  component: ClubSite,
});
