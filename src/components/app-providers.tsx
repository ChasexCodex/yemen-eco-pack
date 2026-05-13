"use client";

import {
  useCallback,
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { translate } from "@/lib/i18n";
import { defaultSiteSettings } from "@/lib/site-defaults";
import { useApiSWR } from "@/lib/swr";
import type { Lang, SiteSettings } from "@/lib/types";

type Theme = "light" | "dark";

type LanguageContextValue = {
  lang: Lang;
  dir: "ltr" | "rtl";
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
};

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

type SettingsContextValue = {
  settings: SiteSettings;
  settingsLoading: boolean;
  refreshSettings: () => Promise<void>;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);
const ThemeContext = createContext<ThemeContextValue | null>(null);
const SettingsContext = createContext<SettingsContextValue | null>(null);

function readStoredLang(): Lang {
  if (typeof window === "undefined") return "en";
  const saved = window.localStorage.getItem("biopak-lang");
  return saved === "ar" ? "ar" : "en";
}

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const saved = window.localStorage.getItem("biopak-theme");
  return saved === "dark" ? "dark" : "light";
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [theme, setThemeState] = useState<Theme>("light");
  const [preferencesReady, setPreferencesReady] = useState(false);
  const {
    data: settingsData,
    isLoading: settingsLoading,
    mutate: mutateSettings,
  } = useApiSWR<SiteSettings>("/api/settings");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setLangState(readStoredLang());
      setThemeState(readStoredTheme());
      setPreferencesReady(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!preferencesReady) return;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    window.localStorage.setItem("biopak-lang", lang);
  }, [lang, preferencesReady]);

  useEffect(() => {
    if (!preferencesReady) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("biopak-theme", theme);
  }, [theme, preferencesReady]);

  const settings = settingsData ?? defaultSiteSettings;

  const refreshSettings = useCallback(async () => {
    await mutateSettings();
  }, [mutateSettings]);

  const languageValue = useMemo<LanguageContextValue>(
    () => ({
      lang,
      dir: lang === "ar" ? "rtl" : "ltr",
      setLang: setLangState,
      t: (key) => translate(lang, key),
    }),
    [lang],
  );

  const themeValue = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme: setThemeState,
      toggleTheme: () => setThemeState((current) => (current === "dark" ? "light" : "dark")),
    }),
    [theme],
  );

  const settingsValue = useMemo<SettingsContextValue>(
    () => ({ settings, settingsLoading, refreshSettings }),
    [settings, settingsLoading, refreshSettings],
  );

  return (
    <LanguageContext.Provider value={languageValue}>
      <ThemeContext.Provider value={themeValue}>
        <SettingsContext.Provider value={settingsValue}>
          {children}
        </SettingsContext.Provider>
      </ThemeContext.Provider>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within AppProviders");
  }
  return context;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within AppProviders");
  }
  return context;
}

export function useSiteSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSiteSettings must be used within AppProviders");
  }
  return context;
}
