"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { en, Translations } from "@/locales/en";
import { ptBR } from "@/locales/pt-BR";

export type Locale = "en" | "pt-BR";

interface LocaleContextType {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: "en",
  t: en,
  setLocale: () => {},
});

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const stored = localStorage.getItem("locale") as Locale;
    if (stored === "en" || stored === "pt-BR") {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    localStorage.setItem("locale", newLocale);
    setLocaleState(newLocale);
  };

  const t = locale === "pt-BR" ? ptBR : en;

  return (
    <LocaleContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => useContext(LocaleContext);
