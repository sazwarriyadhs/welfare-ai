"use client";

import { useI18n } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/messages";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <label className="language-switcher">
      <span>{t("language")}</span>
      <select
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        aria-label={t("language")}
      >
        <option value="en">English</option>
        <option value="id">Bahasa Indonesia</option>
        <option value="ar">العربية</option>
      </select>
    </label>
  );
}
