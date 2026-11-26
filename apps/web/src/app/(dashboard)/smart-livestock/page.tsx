"use client";

import Link from "next/link";
import {
  Activity, ArrowUpRight, MapPin, RadioTower,
  ScanEye, ShieldAlert, Tag, Users
} from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

const modules = [
  { href: "/smart-livestock/ear-tags", key: "earTags", description: "earTagsSubtitle", icon: Tag },
  { href: "/smart-livestock/gps-tracking", key: "gpsTracking", description: "gpsTrackingSubtitle", icon: MapPin },
  { href: "/smart-livestock/geofence", key: "geofence", description: "geofenceSubtitle", icon: ShieldAlert },
  { href: "/smart-livestock/drone-intelligence", key: "droneIntelligence", description: "droneIntelligenceSubtitle", icon: ScanEye },
  { href: "/smart-livestock/herd-intelligence", key: "herdIntelligence", description: "herdIntelligenceSubtitle", icon: Users }
] as const;

export default function SmartLivestockPage() {
  const { t } = useI18n();

  const metrics = [
    { label: "connectedDevices", icon: RadioTower },
    { label: "trackedAnimals", icon: Activity },
    { label: "liveLocations", icon: MapPin },
    { label: "activeAlerts", icon: ShieldAlert }
  ] as const;

  return (
    <main className="content">
      <div style={{ marginBottom: 24 }}>
        <div style={{ color: "var(--primary)", fontSize: 10, fontWeight: 800, letterSpacing: 1.5 }}>
          WELFARE AI / INTELLIGENCE
        </div>
        <h1 style={{ fontSize: 28, margin: "9px 0 7px" }}>{t("smartLivestockTitle")}</h1>
        <p style={{ color: "var(--muted)", fontSize: 13, maxWidth: 760, lineHeight: 1.7, margin: 0 }}>
          {t("smartLivestockSubtitle")}
        </p>
      </div>

      <section className="stats-grid">
        {metrics.map(({ label, icon: Icon }) => (
          <div className="panel" key={label}>
            <div className="stat-top">
              <span>{t(label)}</span>
              <span className="stat-icon"><Icon size={18} /></span>
            </div>
            <div className="stat-value">—</div>
            <div className="stat-note">{t("noDataYet")}</div>
          </div>
        ))}
      </section>

      <section className="panel" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
          <div className="module-icon"><RadioTower size={19} /></div>
          <div>
            <h2 className="panel-title" style={{ margin: 0 }}>{t("smartLivestockOverview")}</h2>
            <p className="panel-subtitle" style={{ margin: "4px 0 0" }}>{t("smartLivestockOverviewDescription")}</p>
          </div>
        </div>
        <p style={{ color: "var(--muted)", fontSize: 11, lineHeight: 1.7, margin: "14px 0 0" }}>
          {t("sourceDescription")}
        </p>
      </section>

      <section className="module-grid">
        {modules.map(({ href, key, description, icon: Icon }) => (
          <Link
            href={href}
            key={href}
            className="module-card"
            style={{ display: "block", color: "inherit", textDecoration: "none", background: "#fff" }}
          >
            <div className="module-icon"><Icon size={18} /></div>
            <h3>{t(key)}</h3>
            <p>{t(description)}</p>
            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 14,
              color: "var(--primary)"
            }}>
              <ArrowUpRight size={16} />
            </div>
          </Link>
        ))}
      </section>

      <section className="panel" style={{ marginTop: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 750, marginBottom: 7 }}>{t("simulationLabel")}</div>
        <p style={{ color: "var(--muted)", fontSize: 11, lineHeight: 1.7, margin: 0 }}>
          {t("simulationDescription")}
        </p>
        <div style={{ fontSize: 12, fontWeight: 750, margin: "17px 0 7px" }}>{t("sourceLabel")}</div>
        <p style={{ color: "var(--muted)", fontSize: 11, lineHeight: 1.7, margin: 0 }}>
          {t("sourceDescription")}
        </p>
      </section>
    </main>
  );
}
