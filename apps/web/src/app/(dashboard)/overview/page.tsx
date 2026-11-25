import {
  Activity, AlertTriangle, Bird, ClipboardCheck, Leaf,
  MapPinned, ShieldCheck, Waves
} from "lucide-react";

const stats = [
  { label: "Registered Animals", value: "—", note: "Awaiting live API integration", icon: Bird },
  { label: "Welfare Inspections", value: "—", note: "Awaiting live API integration", icon: ClipboardCheck },
  { label: "Open Incidents", value: "—", note: "Awaiting live API integration", icon: AlertTriangle },
  { label: "Active Sites", value: "—", note: "Awaiting live API integration", icon: MapPinned },
];

const modules = [
  { title: "Livestock Intelligence", description: "Animal registry, identification and welfare history.", icon: Bird },
  { title: "Welfare Inspections", description: "Field observations, inspections and evidence collection.", icon: ClipboardCheck },
  { title: "Incident Management", description: "Welfare incidents, severity and corrective actions.", icon: ShieldCheck },
  { title: "Farm & Land Intelligence", description: "Farm boundaries, paddocks, vegetation and environment.", icon: Leaf },
  { title: "Drone Intelligence", description: "Drone fleet integration, missions and aerial surveys.", icon: Waves },
  { title: "AI Intelligence Engine", description: "Computer vision, risk indicators and human verification.", icon: Activity },
];

export default function OverviewPage() {
  return (
    <main className="content">
      <div className="page-heading">
        <div>
          <div className="eyebrow">PLATFORM OVERVIEW</div>
          <h1>Welfare Command Centre</h1>
          <p>Central intelligence workspace for animal welfare operations.</p>
        </div>
        <button className="button-primary">Platform Overview</button>
      </div>

      <div className="stats-grid">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <section className="panel" key={item.label}>
              <div className="stat-top">
                <span>{item.label}</span>
                <div className="stat-icon"><Icon size={18}/></div>
              </div>
              <div className="stat-value">{item.value}</div>
              <div className="stat-note">{item.note}</div>
            </section>
          );
        })}
      </div>

      <div className="section-grid">
        <section className="panel">
          <h2 className="panel-title">Platform Activity</h2>
          <p className="panel-subtitle">Operational activity feed will appear here when connected to the API.</p>
          <div className="activity-row">
            <div className="activity-dot"/>
            <div><div className="activity-name">Platform foundation initialized</div><div className="activity-desc">Web application workspace created</div></div>
            <span className="status">Foundation</span>
          </div>
          <div className="activity-row">
            <div className="activity-dot"/>
            <div><div className="activity-name">Intelligence modules scaffolded</div><div className="activity-desc">Farm, livestock, drone and welfare modules</div></div>
            <span className="status">Structure</span>
          </div>
          <div className="activity-row">
            <div className="activity-dot"/>
            <div><div className="activity-name">Backend integration pending</div><div className="activity-desc">Live operational data is not connected yet</div></div>
            <span className="status">Pending</span>
          </div>
        </section>

        <section className="panel">
          <h2 className="panel-title">Intelligence Modules</h2>
          <p className="panel-subtitle">Core platform capabilities</p>
          <div className="module-grid">
            {modules.map((item) => {
              const Icon = item.icon;
              return (
                <div className="module-card" key={item.title}>
                  <div className="module-icon"><Icon size={18}/></div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
