import { createFileRoute } from "@tanstack/react-router";
import { ClubSite } from "@/components/club/ClubSite";
import { loadClubData } from "@/lib/club/ssr-data";

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
  loader: ({ context }) => loadClubData(context.queryClient),
  component: ClubSite,
});
