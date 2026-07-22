import React, { createContext, useContext, useState, useEffect } from "react";
import { translations } from "../lib/translations";

const LanguageContext = createContext(null);

export function LanguageProvider({ children, settingsLang, onLangChange }) {
  const [currentLang, setCurrentLang] = useState(settingsLang || "RU");

  useEffect(() => {
    if (settingsLang) {
      setCurrentLang(settingsLang);
    }
  }, [settingsLang]);

  const changeLang = (lang) => {
    setCurrentLang(lang);
    if (onLangChange) {
      onLangChange(lang);
    }
  };

  const t = (text) => {
    if (currentLang === "EN") {
      return translations[text] || text;
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ currentLang, setLanguage: changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}
