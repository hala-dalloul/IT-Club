import { createFileRoute } from "@tanstack/react-router";
import { ClubSite } from "@/components/club/ClubSite";
const titles: Record<string, string> = {
  about: "من نحن | About",
  projects: "المشاريع | Projects",
  members: "الفريق | Team",
  events: "الفعاليات | Events",
  achievements: "الإنجازات | Achievements",
  partners: "الشراكات | Partners",
  join: "انضم إلينا | Join",
  contact: "تواصل معنا | Contact",
  admin: "الإدارة | Admin",
};
export const Route = createFileRoute("/club/$")({
  head: ({ params }) => ({
    meta: [
      { title: `${titles[params._splat?.split("/")[0] || ""] || "UCAS"} — UCAS IT CLUB` },
      {
        name: "description",
        content: "تعرّف على مجتمع نادي تكنولوجيا المعلومات ومشاريعه وأنشطته في UCAS.",
      },
      ...(params._splat?.startsWith("admin")
        ? [{ name: "robots", content: "noindex,nofollow" }]
        : []),
    ],
  }),
  component: ClubSite,
});
