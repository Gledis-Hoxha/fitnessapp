import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { translations } from "./translations";

const LANG_KEY = "app_language";

const LanguageContext = createContext({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => localStorage.getItem(LANG_KEY) || "en");

  useEffect(() => {
    localStorage.setItem(LANG_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((code) => setLanguageState(code), []);

  const t = useCallback(
    (key) => {
      const dict = translations[language] || translations.en;
      return dict[key] ?? translations.en[key] ?? key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}