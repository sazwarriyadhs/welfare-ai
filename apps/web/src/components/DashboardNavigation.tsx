"use client";

import Link from "next/link";
import {
  AlertTriangle, BarChart3, Bird, ClipboardCheck,
  LayoutDashboard, Map, Settings, ShieldCheck, Waves, RadioTower
} from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

const navigation = [
  {
    label: "overview",
    items: [
      { name: "commandCentre", href: "/overview", icon: LayoutDashboard },
      { name: "analytics", href: "/analytics", icon: BarChart3 }
    ]
  },
  {
    label: "welfareOperations",
    items: [
      { name: "animals", href: "/animals", icon: Bird },
      { name: "inspections", href: "/inspections", icon: ClipboardCheck },
      { name: "incidents", href: "/incidents", icon: AlertTriangle },
      { name: "correctiveActions", href: "/corrective-actions", icon: ShieldCheck }
    ]
  },
  {
    label: "intelligence",
    items: [
      { name: "smartLivestock", href: "/smart-livestock", icon: RadioTower },
      { name: "farmLand", href: "/farm-land", icon: Map },
      { name: "drone", href: "/drone", icon: Waves }
    ]
  },
  {
    label: "system",
    items: [
      { name: "settings", href: "/settings", icon: Settings }
    ]
  }
] as const;

export function DashboardNavigation() {
  const { t } = useI18n();

  return (
    <>
      {navigation.map((group) => (
        <div key={group.label}>
          <div className="nav-label">{t(group.label)}</div>
          {group.items.map((item) => {
            const Icon = item.icon;
            return (
              <Link className="nav-link" href={item.href} key={item.href}>
                <Icon size={17} strokeWidth={1.8} />
                <span>{t(item.name)}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </>
  );
}
