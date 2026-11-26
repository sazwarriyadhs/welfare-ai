"use client";

import Link from "next/link";
import { ArrowLeft, Database, RadioTower } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import type { MessageKey } from "@/i18n/messages";

type Props = {
  titleKey: MessageKey;
  subtitleKey: MessageKey;
  emptyKey: MessageKey;
};

export function SmartLivestockSection({
  titleKey,
  subtitleKey,
  emptyKey
}: Props) {
  const { t } = useI18n();

  return (
    <main className="content">
      <div style={{ marginBottom: 22 }}>
        <Link
          href="/smart-livestock"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: "var(--primary)",
            fontSize: 12,
            textDecoration: "none",
            marginBottom: 18
          }}
        >
          <ArrowLeft size={15} />
          {t("smartLivestockOverview")}
        </Link>

        <div style={{ color: "var(--primary)", fontSize: 10, fontWeight: 800, letterSpacing: 1.5 }}>
          WELFARE AI / SMART LIVESTOCK
        </div>
        <h1 style={{ fontSize: 27, margin: "9px 0 7px" }}>{t(titleKey)}</h1>
        <p style={{ color: "var(--muted)", fontSize: 13, margin: 0 }}>
          {t(subtitleKey)}
        </p>
      </div>

      <section className="panel" style={{ padding: 26 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <div className="module-icon"><RadioTower size={19} /></div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 750 }}>{t("noDataYet")}</div>
            <div style={{ color: "var(--muted)", fontSize: 11 }}>{t("integrationFoundation")}</div>
          </div>
        </div>

        <div style={{
          padding: 18,
          border: "1px dashed var(--border)",
          borderRadius: 10,
          display: "flex",
          alignItems: "flex-start",
          gap: 12
        }}>
          <Database size={19} color="var(--muted)" />
          <div>
            <div style={{ fontSize: 13, fontWeight: 650, marginBottom: 5 }}>
              {t(emptyKey)}
            </div>
            <p style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.7, margin: 0 }}>
              {t("integrationFoundationDescription")}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
