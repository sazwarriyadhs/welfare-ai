"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";

type Animal = {
  id: string;
  species: string;
  site_name?: string;
};

type AnimalsResponse = {
  count: number;
  animals: Animal[];
};

function speciesIcon(species: string): string | null {
  switch (species.toLowerCase()) {
    case "cattle":
      return "/images/livestock/icon_cattle.png";
    case "sheep":
      return "/images/livestock/icon_sheep.png";
    case "goat":
      return "/images/livestock/icon_goat.png";
    default:
      return null;
  }
}

export default function FarmLandPage() {
  const { t, formatNumber } = useI18n();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAnimals() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/animals", {
          method: "GET",
          cache: "no-store",
          headers: { Accept: "application/json" },
          signal: controller.signal
        });

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(
            typeof payload?.error === "string"
              ? payload.error
              : t("fetchAnimalsError")
          );
        }

        if (
          !Array.isArray(payload?.animals) ||
          typeof payload?.count !== "number"
        ) {
          throw new Error(t("invalidAnimalsResponse"));
        }

        if (controller.signal.aborted) return;

        setAnimals(payload.animals as Animal[]);
        setCount(payload.count);
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error ? err.message : t("genericFetchError")
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadAnimals();

    return () => controller.abort();
  }, [reload, t]);

  const speciesCounts = useMemo(() => {
    const counts = { cattle: 0, sheep: 0, goat: 0, other: 0 };

    for (const animal of animals) {
      const species = animal.species.toLowerCase();

      if (species === "cattle") counts.cattle += 1;
      else if (species === "sheep") counts.sheep += 1;
      else if (species === "goat") counts.goat += 1;
      else counts.other += 1;
    }

    return counts;
  }, [animals]);

  const siteCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    for (const animal of animals) {
      const site = animal.site_name?.trim();

      if (site) counts[site] = (counts[site] ?? 0) + 1;
    }

    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [animals]);

  const speciesCards = [
    { key: "cattle", label: t("cattle"), count: speciesCounts.cattle },
    { key: "sheep", label: t("sheep"), count: speciesCounts.sheep },
    { key: "goat", label: t("goat"), count: speciesCounts.goat }
  ] as const;

  return (
    <main className="content">
      <div className="eyebrow">{t("moduleEyebrow")}</div>

      <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {t("farmLandTitle")}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {t("farmLandSubtitle")}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setReload((value) => value + 1)}
          disabled={loading}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {loading ? t("loading") : t("refresh")}
        </button>
      </div>

      {error && (
        <section className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-800">
            {t("farmLandLoadError")}
          </p>
          <p className="mt-1 text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => setReload((value) => value + 1)}
            className="mt-3 text-sm font-semibold text-red-800 underline"
          >
            {t("retry")}
          </button>
        </section>
      )}

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">{t("totalAnimals")}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {loading ? "—" : formatNumber(count)}
          </p>
          <p className="mt-1 text-xs text-slate-400">{t("backendCount")}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">{t("farmSites")}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {loading ? "—" : formatNumber(siteCounts.length)}
          </p>
          <p className="mt-1 text-xs text-slate-400">{t("farmSiteOverview")}</p>
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-3">
          <h2 className="text-base font-bold text-slate-800">{t("speciesOverview")}</h2>
          <p className="mt-1 text-xs text-slate-500">{t("animalsBySpecies")}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {speciesCards.map((item) => (
            <div
              key={item.key}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5"
            >
              <img
                src={speciesIcon(item.key)!}
                alt=""
                width={54}
                height={54}
                className="h-14 w-14 object-contain"
              />
              <div>
                <p className="text-sm font-medium text-slate-500">{item.label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {loading ? "—" : formatNumber(item.count)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {!loading && speciesCounts.other > 0 && (
          <p className="mt-3 text-xs text-slate-500">
            {t("other")}: {formatNumber(speciesCounts.other)}
          </p>
        )}
      </section>

      <section className="mt-7 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-base font-bold text-slate-800">{t("farmSiteOverview")}</h2>
          <p className="mt-1 text-xs text-slate-500">{t("animalsCount")}</p>
        </div>

        {loading ? (
          <p className="p-6 text-sm text-slate-500">{t("loading")}</p>
        ) : siteCounts.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">{t("noSiteData")}</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {siteCounts.map(([site, siteCount]) => (
              <div
                key={site}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
              >
                <span className="text-sm font-medium text-slate-700">{site}</span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {formatNumber(siteCount)} {t("animalsCount")}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="mt-4 text-xs text-slate-400">{t("farmLandDataNote")}</p>
    </main>
  );
}
