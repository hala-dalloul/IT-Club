import { createFileRoute } from "@tanstack/react-router";
import { ClubSite } from "@/components/club/ClubSite";

const titles = {
  about: "من نحن | About",
  members: "الفريق | Team",
  events: "الفعاليات | Events",
  news: "الأخبار | News",
  partners: "الشراكات | Partners",
  join: "انضم إلينا | Join",
  contact: "تواصل معنا | Contact",
  admin: "الإدارة | Admin",
} satisfies Record<string, string>;

function titleFor(section: string | undefined): string {
  if (section && Object.hasOwn(titles, section)) {
    // SAFETY: hasOwn above confirms section is one of titles' known keys.
    return titles[section as keyof typeof titles];
  }

  return "UCAS";
}

export const Route = createFileRoute("/club/$")({
  head: ({ params }) => ({
    meta: [
      { title: `${titleFor(params._splat?.split("/")[0])} — UCAS IT CLUB` },
      {
        name: "description",
        content: "تعرّف على مجتمع نادي تكنولوجيا المعلومات وأنشطته في UCAS.",
      },
      ...(params._splat?.startsWith("admin")
        ? [{ name: "robots", content: "noindex,nofollow" }]
        : []),
    ],
  }),
  component: ClubSite,
});
