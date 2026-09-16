import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  emptySettings,
  type Content,
  type ContentCollection,
  type Lang,
  type Settings,
} from "@/lib/club/model";
import { configured, loadPublic, SetupRequiredError } from "@/lib/club/supabase";
import { recordVisit } from "@/lib/club/visits";

const emptyData: Record<ContentCollection, Content[]> = {
  members: [],
  events: [],
  partners: [],
};

const clubPublicKey = ["club-public"];

const Context = createContext({
  // SAFETY: "ar" is a valid member of Lang; widened so setLang's default matches the type below.
  lang: "ar" as Lang,
  setLang: (_lang: Lang) => {},
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
  const [lang, setLang] = useState<Lang>("ar");
  useEffect(() => {
    try {
      if (localStorage.getItem("ucas-language") === "en") setLang("en");
    } catch {
      /* Keep the in-memory language if browser storage is disabled. */
    }
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

    try {
      localStorage.setItem("ucas-language", lang);
    } catch {
      /* Storage is optional. */
    }
  }, [lang]);
  const queryClient = useQueryClient();
  useEffect(() => {
    const onChanged = () => void queryClient.invalidateQueries({ queryKey: clubPublicKey });
    window.addEventListener("club-data-changed", onChanged);

    return () => window.removeEventListener("club-data-changed", onChanged);
  }, [queryClient]);

  const query = useQuery({
    queryKey: clubPublicKey,
    queryFn: loadPublic,
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
    () => ({ lang, setLang, data, settings, loading, error, setupRequired, visitorCount }),
    [lang, setLang, data, settings, loading, error, setupRequired, visitorCount],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export const useClub = () => useContext(Context);
