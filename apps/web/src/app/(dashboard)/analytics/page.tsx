"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bird,
  Building2,
  ClipboardCheck,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type Animal = {
  id: string;
  species: string;
  sex: string;
  breed: string;
  status: string;
  date_of_birth?: string;
  site_name?: string;
};

function label(value: string) {
  if (!value) return "Unknown";

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function Distribution({
  title,
  subtitle,
  data,
}: {
  title: string;
  subtitle: string;
  data: { name: string; count: number }[];
}) {
  const maximum = Math.max(1, ...data.map((item) => item.count));

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-bold text-slate-800">{title}</h2>
      <p className="mb-5 mt-1 text-xs text-slate-500">{subtitle}</p>

      {data.length === 0 ? (
        <div className="rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-500">
          No recorded data available.
        </div>
      ) : (
        <div className="space-y-5">
          {data.map((item) => (
            <div key={item.name}>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700">
                  {label(item.name)}
                </span>
                <span className="font-semibold tabular-nums text-slate-600">
                  {item.count}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-600 transition-all"
                  style={{
                    width: `${(item.count / maximum) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Metric({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: typeof Bird;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500">{title}</p>
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
          <Icon size={19} />
        </div>
      </div>

      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">{description}</p>
    </section>
  );
}

export default function AnalyticsPage() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [apiCount, setApiCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestAnimals = useCallback(async (): Promise<{
    animals: Animal[];
    count: number;
  }> => {
    const response = await fetch("/api/animals", {
      method: "GET",
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result?.error || "Unable to retrieve animal records.",
      );
    }

    if (
      !Array.isArray(result.animals) ||
      typeof result.count !== "number"
    ) {
      throw new Error("Invalid Animals API response.");
    }

    return {
      animals: result.animals,
      count: result.count,
    };
  }, []);

  const refreshData = useCallback(() => {
    setLoading(true);
    setError(null);

    void requestAnimals()
      .then((result) => {
        setAnimals(result.animals);
        setApiCount(result.count);
      })
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [requestAnimals]);

  useEffect(() => {
    let cancelled = false;

    void requestAnimals()
      .then((result) => {
        if (cancelled) return;

        setAnimals(result.animals);
        setApiCount(result.count);
      })
      .catch((err) => {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred.",
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [requestAnimals]);
  const species = useMemo(() => {
    const counts = new Map<string, number>();

    animals.forEach((animal) => {
      const key = animal.species || "unknown";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    return Array.from(counts, ([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [animals]);

  const statuses = useMemo(() => {
    const counts = new Map<string, number>();

    animals.forEach((animal) => {
      const key = animal.status || "unknown";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    return Array.from(counts, ([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [animals]);

  const siteDistribution = useMemo(() => {
    const counts = new Map<string, number>();

    animals.forEach((animal) => {
      const key = animal.site_name?.trim() || "Unassigned";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    return Array.from(counts, ([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [animals]);

  const activeCount = useMemo(
    () => animals.filter((animal) => animal.status === "active").length,
    [animals],
  );

  const formatNumber = (value: number) =>
    value.toLocaleString("en-NZ");

  return (
    <main className="content">
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="eyebrow">WELFARE AI MODULE</div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welfare Analytics
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Operational intelligence and animal population overview.
          </p>
        </div>

        <button
          type="button"
          onClick={refreshData}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "Refreshing..." : "Refresh data"}
        </button>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-100 bg-emerald-50/60 px-4 py-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
          <Activity size={15} />
          Animal register data
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
          API snapshot
        </span>
      </div>

      {error && (
        <section className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-red-800">
            <AlertTriangle size={17} />
            Analytics data unavailable
          </div>
          <p className="mt-2 text-xs text-red-700">{error}</p>
          <button
            type="button"
            onClick={refreshData}
            className="mt-3 text-xs font-semibold text-red-800 underline"
          >
            Try again
          </button>
        </section>
      )}

      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          title="Registered Animals"
          value={loading ? "—" : formatNumber(apiCount)}
          description="Total records returned by API"
          icon={Bird}
        />
        <Metric
          title="Active Animals"
          value={loading ? "—" : formatNumber(activeCount)}
          description="Records with active status"
          icon={Activity}
        />
        <Metric
          title="Species Recorded"
          value={loading ? "—" : formatNumber(species.length)}
          description="Distinct recorded species"
          icon={Sparkles}
        />
        <Metric
          title="Sites Represented"
          value={loading ? "—" : formatNumber(
            siteDistribution.filter((item) => item.name !== "Unassigned").length
          )}
          description="Sites appearing in animal records"
          icon={Building2}
        />
      </section>

      {loading && animals.length === 0 && !error ? (
        <section className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          Loading operational animal data...
        </section>
      ) : (
        <>
          <section className="mb-6 grid gap-5 xl:grid-cols-2">
            <Distribution
              title="Species Distribution"
              subtitle="Animal population grouped by recorded species"
              data={species}
            />
            <Distribution
              title="Animal Status"
              subtitle="Current status distribution from animal records"
              data={statuses}
            />
          </section>

          <section className="mb-6 grid gap-5 xl:grid-cols-2">
            <Distribution
              title="Site Population"
              subtitle="Animals grouped by their recorded farm site"
              data={siteDistribution}
            />

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="text-sm font-bold text-slate-800">
                Intelligence Modules
              </h2>
              <p className="mb-4 mt-1 text-xs text-slate-500">
                Operational data availability
              </p>

              {[
                {
                  name: "Welfare Observations",
                  detail: "Observation records are not yet connected to this dashboard.",
                  icon: Activity,
                },
                {
                  name: "Incident Monitoring",
                  detail: "Incident metrics await operational API integration.",
                  icon: AlertTriangle,
                },
                {
                  name: "Inspection Activity",
                  detail: "Inspection metrics await operational API integration.",
                  icon: ClipboardCheck,
                },
                {
                  name: "Corrective Actions",
                  detail: "Corrective action metrics await operational API integration.",
                  icon: ShieldCheck,
                },
                {
                  name: "AI & Drone Intelligence",
                  detail: "AI assessments and drone metrics are not included in this API snapshot.",
                  icon: Sparkles,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.name}
                    className="flex items-start gap-3 border-t border-slate-100 py-3 first:border-0"
                  >
                    <div className="rounded-lg bg-slate-100 p-2 text-slate-500">
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-800">
                        {item.name}
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                        {item.detail}
                      </p>
                    </div>
                    <span className="whitespace-nowrap rounded-full bg-amber-50 px-2 py-1 text-[9px] font-semibold text-amber-700">
                      Pending
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 p-5">
              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  Animal Register Snapshot
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Sample of registered animal records returned by the API
                </p>
              </div>
              <span className="text-[10px] text-slate-400">
                {formatNumber(animals.length)} records loaded
              </span>
            </div>

            {animals.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-500">
                No animal records available.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs text-slate-500">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Animal ID</th>
                      <th className="px-5 py-3 font-semibold">Species</th>
                      <th className="px-5 py-3 font-semibold">Breed</th>
                      <th className="px-5 py-3 font-semibold">Site</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {animals.slice(0, 10).map((animal) => (
                      <tr key={animal.id} className="hover:bg-slate-50">
                        <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-slate-600">
                          {animal.id}
                        </td>
                        <td className="px-5 py-3 font-medium text-slate-800">
                          {label(animal.species)}
                        </td>
                        <td className="px-5 py-3 text-slate-600">
                          {animal.breed || "—"}
                        </td>
                        <td className="px-5 py-3 text-slate-600">
                          {animal.site_name || "Unassigned"}
                        </td>
                        <td className="px-5 py-3">
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                            {label(animal.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      <p className="mt-5 text-[11px] leading-relaxed text-slate-400">
        Source: Welfare AI Animals API. Population metrics are calculated from
        the returned animal records. Health scores, welfare trends, and
        inspection performance are intentionally omitted until their
        operational data sources are integrated.
      </p>
    </main>
  );
}