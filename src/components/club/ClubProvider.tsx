import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  emptySettings,
  type Content,
  type ContentCollection,
  type Lang,
  type Settings,
} from "@/lib/club/model";
import { configured, loadPublic, watchQuery, SetupRequiredError } from "@/lib/club/supabase";
const emptyData: Record<ContentCollection, Content[]> = {
  members: [],
  events: [],
  achievements: [],
  partners: [],
};
const Context = createContext({
  lang: "ar" as Lang,
  setLang: (_lang: Lang) => {},
  data: emptyData,
  settings: emptySettings,
  loading: false,
  error: false,
  setupRequired: false,
});
export function ClubProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("ar");
  const [data, setData] = useState(emptyData);
  const [settings, setSettings] = useState<Settings>(emptySettings);
  const [loading, setLoading] = useState(configured);
  const [error, setError] = useState(false);
  const [setupRequired, setSetupRequired] = useState(false);
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
  useEffect(() => {
    if (!configured) return;
    return watchQuery(
      loadPublic,
      (value) => {
        setData(value.data);
        setSettings({ ...emptySettings, ...value.settings });
        setLoading(false);
        setError(false);
        setSetupRequired(false);
      },
      (error) => {
        setLoading(false);
        setSetupRequired(error instanceof SetupRequiredError);
        setError(!(error instanceof SetupRequiredError));
      },
    );
  }, []);
  useEffect(
    () => () => {
      document.documentElement.lang = "ar";
      document.documentElement.dir = "rtl";
    },
    [],
  );
  return (
    <Context.Provider value={{ lang, setLang, data, settings, loading, error, setupRequired }}>
      {children}
    </Context.Provider>
  );
}
export const useClub = () => useContext(Context);
