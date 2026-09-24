import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  emptySettings,
  type Content,
  type ContentCollection,
  type Lang,
  type Settings,
} from "@/lib/club/model";
import { configured, loadPublic, SetupRequiredError } from "@/lib/club/public-api";
import { recordVisit } from "@/lib/club/visits";
import { useLocation } from "@tanstack/react-router";
import { langOf } from "@/lib/club/paths";

const emptyData: Record<ContentCollection, Content[]> = {
  members: [],
  events: [],
  news: [],
  partners: [],
};

export const clubPublicKey = ["club-public"];

const Context = createContext({
  // SAFETY: "ar" is a valid member of Lang; widened so the provider's URL-derived value fits.
  lang: "ar" as Lang,
  data: emptyData,
  settings: emptySettings,
  // SAFETY: no visit count is known yet; widened so ClubProvider's setVisitorCount(number) fits.
  visitorCount: null as number | null,
  loading: false,
  error: false,
  setupRequired: false,
});

export function ClubProvider({ children }: { children: ReactNode }) {
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  useEffect(() => {
    let active = true;
    void recordVisit()
      .then((count) => {
        if (active) setVisitorCount(count);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);
  // The URL is the language: /en/... is English, everything else Arabic. No
  // cookie or stored preference, so every address shows one language to
  // everyone, search engines included.
  const lang = langOf(useLocation().pathname);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);
  const queryClient = useQueryClient();
  useEffect(() => {
    const onChanged = () => void queryClient.invalidateQueries({ queryKey: clubPublicKey });
    window.addEventListener("club-data-changed", onChanged);

    return () => window.removeEventListener("club-data-changed", onChanged);
  }, [queryClient]);

  const query = useQuery({
    queryKey: clubPublicKey,
    queryFn: () => loadPublic(),
    enabled: configured,
    staleTime: 60000,
    refetchInterval: 60000,
  });

  const data = query.data?.data ?? emptyData;

  const settings = useMemo<Settings>(
    () => ({ ...emptySettings, ...query.data?.settings }),
    [query.data?.settings],
  );

  const loading = configured && query.isLoading;
  const setupRequired = query.error instanceof SetupRequiredError;
  const error = Boolean(query.error) && !setupRequired;

  useEffect(
    () => () => {
      document.documentElement.lang = "ar";
      document.documentElement.dir = "rtl";
    },
    [],
  );

  const value = useMemo(
    () => ({ lang, data, settings, loading, error, setupRequired, visitorCount }),
    [lang, data, settings, loading, error, setupRequired, visitorCount],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export const useClub = () => useContext(Context);
