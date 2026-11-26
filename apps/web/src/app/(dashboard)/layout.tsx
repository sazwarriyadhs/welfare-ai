import Image from "next/image";
import { DashboardNavigation } from "@/components/DashboardNavigation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand">
          <Image
            src="/branding/welfare-ai-logo.png"
            alt="WELFARE AI"
            width={180}
            height={60}
            priority
          />
        </div>
        <DashboardNavigation />
        <div className="sidebar-footer">
          <div style={{ fontWeight: 700 }}>WELFARE AI Platform</div>
          <div style={{ fontSize: 10, marginTop: 5 }}>
            Development Environment
          </div>
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <div className="topbar-title">
            <span className="desktop-workspace">
              Animal Welfare Intelligence Platform / Workspace
            </span>
            <span className="mobile-workspace">WELFARE AI</span>
          </div>
          <div className="topbar-right">
            <LanguageSwitcher />
            <span className="environment-label">Development</span>
            <div className="avatar">A</div>
            <span className="administrator-label">Administrator</span>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
