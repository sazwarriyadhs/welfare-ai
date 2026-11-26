"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode
} from "react";
import {
  messages,
  localeTags,
  localeDirections,
  type Locale,
  type MessageKey
} from "./messages";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey) => string;
  formatNumber: (value: number) => string;
  formatDate: (value?: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);
const STORAGE_KEY = "welfare-ai-locale";

const listeners = new Set<() => void>();
let currentLocale: Locale = "en";

function isLocale(value: string | null): value is Locale {
  return value === "en" || value === "id" || value === "ar";
}

function getLocaleSnapshot(): Locale {
  if (typeof window === "undefined") return "en";

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (isLocale(saved)) {
      currentLocale = saved;
      return saved;
    }
  } catch {
    // Fall back to the in-memory locale when storage is unavailable.
  }

  return currentLocale;
}

function getServerLocaleSnapshot(): Locale {
  return "en";
}

function emitLocaleChange() {
  listeners.forEach((listener) => listener());
}

function subscribeLocale(listener: () => void) {
  listeners.add(listener);

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY && event.key !== null) return;

    currentLocale = isLocale(event.newValue) ? event.newValue : "en";
    emitLocaleChange();
  };

  window.addEventListener("storage", handleStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(
    subscribeLocale,
    getLocaleSnapshot,
    getServerLocaleSnapshot
  );

  const setLocale = useCallback((nextLocale: Locale) => {
    currentLocale = nextLocale;

    try {
      window.localStorage.setItem(STORAGE_KEY, nextLocale);
    } catch {
      // Language selection remains active for the current session.
    }

    emitLocaleChange();
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = localeDirections[locale];
  }, [locale]);

  const t = useCallback(
    (key: MessageKey) => messages[locale][key],
    [locale]
  );

  const formatNumber = useCallback(
    (value: number) =>
      new Intl.NumberFormat(localeTags[locale]).format(value),
    [locale]
  );

  const formatDate = useCallback(
    (value?: string) => {
      if (!value) return "—";
      const date = new Date(`${value.slice(0, 10)}T00:00:00`);
      if (Number.isNaN(date.getTime())) return value;

      return new Intl.DateTimeFormat(localeTags[locale], {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }).format(date);
    },
    [locale]
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, formatNumber, formatDate }),
    [locale, setLocale, t, formatNumber, formatDate]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}
