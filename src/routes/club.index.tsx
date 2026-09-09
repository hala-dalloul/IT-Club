import { createFileRoute } from "@tanstack/react-router";
import { ClubSite } from "@/components/club/ClubSite";
export const Route = createFileRoute("/club/")({
  head: () => ({
    meta: [
      { title: "UCAS IT CLUB | نادي تكنولوجيا المعلومات" },
      {
        name: "description",
        content:
          "مشاريع وفريق وفعاليات نادي تكنولوجيا المعلومات في الكلية الجامعية للعلوم التطبيقية.",
      },
    ],
  }),
  component: ClubSite,
});
