import Link from "next/link";
import Image from "next/image";
import {
  AlertTriangle, BarChart3, Bird, ClipboardCheck,
  LayoutDashboard, Map, Settings, ShieldCheck,
  Waves
} from "lucide-react";

const navigation = [
  { label: "OVERVIEW", items: [
    { name: "Command Centre", href: "/overview", icon: LayoutDashboard },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
  ]},
  { label: "WELFARE OPERATIONS", items: [
    { name: "Animals & Livestock", href: "/animals", icon: Bird },
    { name: "Inspections", href: "/inspections", icon: ClipboardCheck },
    { name: "Incidents", href: "/incidents", icon: AlertTriangle },
    { name: "Corrective Actions", href: "/corrective-actions", icon: ShieldCheck },
  ]},
  { label: "INTELLIGENCE", items: [
    { name: "Farm & Land", href: "/farm-land", icon: Map },
    { name: "Drone Intelligence", href: "/drone", icon: Waves },
  ]},
  { label: "SYSTEM", items: [
    { name: "Settings", href: "/settings", icon: Settings },
  ]},
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand">
          <Image src="/branding/welfare-ai-logo.png" alt="WELFARE AI" width={180} height={60} priority />
        </div>{navigation.map((group) => (
          <div key={group.label}>
            <div className="nav-label">{group.label}</div>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link className="nav-link" href={item.href} key={item.href}>
                  <Icon size={17} strokeWidth={1.8} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        ))}
        <div className="sidebar-footer">
          <div style={{fontWeight:700}}>WELFARE AI Platform</div>
          <div style={{fontSize:10,marginTop:5}}>Development Environment</div>
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <div className="topbar-title">Animal Welfare Intelligence Platform / Workspace</div>
          <div className="topbar-right">
            <span>Development</span>
            <div className="avatar">A</div>
            <span>Administrator</span>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

