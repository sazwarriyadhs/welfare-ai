"use client";

import { useI18n } from "@/i18n/I18nProvider";

export default function IncidentsPage() {
  const { t } = useI18n();

  return (
    <main className="content">
      <div className="eyebrow">{t("moduleEyebrow")}</div>

      <h1 style={{ fontSize: 25, fontWeight: 750 }}>
        {t("incidentsTitle")}
      </h1>

      <p style={{ color: "#718078", fontSize: 13, marginTop: 10 }}>
        {t("incidentsSubtitle")}
      </p>

      <section className="panel" style={{ marginTop: 25 }}>
        <h2 className="panel-title">{t("moduleFoundation")}</h2>

        <p className="panel-subtitle">
          {t("incidentsScaffoldNotice")}
        </p>
      </section>
    </main>
  );
}