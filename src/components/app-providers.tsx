"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { translate } from "@/lib/i18n";
import type { Lang, SiteSettings } from "@/lib/types";

type Theme = "light" | "dark";

const defaultSettings: SiteSettings = {
  logo_url: "/logo.png",
  contact_email: "info@biopak.ye",
  contact_phone: "+967-1-555-0100",
  address_en: "Sana'a, Yemen",
  address_ar: "صنعاء، اليمن",
  tagline_en: "Sustainable solutions for a greener Yemen.",
  tagline_ar: "حلول مستدامة من أجل يمن أكثر اخضرارا.",
};

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

async function fetchSettings(): Promise<SiteSettings> {
  const response = await fetch("/api/settings", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Unable to load site settings");
  }
  return response.json() as Promise<SiteSettings>;
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => readStoredLang());
  const [theme, setThemeState] = useState<Theme>(() => readStoredTheme());
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    window.localStorage.setItem("biopak-lang", lang);
  }, [lang]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("biopak-theme", theme);
  }, [theme]);

  const refreshSettings = async () => {
    const nextSettings = await fetchSettings();
    setSettings(nextSettings);
  };

  useEffect(() => {
    fetchSettings().then(setSettings).catch(() => undefined);
  }, []);

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
    () => ({ settings, refreshSettings }),
    [settings],
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

