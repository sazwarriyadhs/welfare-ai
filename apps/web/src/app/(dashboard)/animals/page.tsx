"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimalForm } from "@/features/animals/AnimalForm";
import { useI18n } from "@/i18n/I18nProvider";

type Animal = {
  id: string;
  species: string;
  sex: string;
  breed: string;
  status: string;
  date_of_birth?: string;
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

function statusClass(status: string) {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-emerald-50 text-emerald-700";
    case "sick":
      return "bg-red-50 text-red-700";
    case "quarantined":
      return "bg-amber-50 text-amber-700";
    case "deceased":
      return "bg-slate-100 text-slate-600";
    default:
      return "bg-blue-50 text-blue-700";
  }
}

export default function AnimalsPage() {
  const { t, formatNumber, formatDate } = useI18n();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");

  const requestController = useRef<AbortController | null>(null);

  const fetchAnimals = useCallback(async (signal: AbortSignal) => {
    const response = await fetch("/api/animals", {
      method: "GET",
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal
    });

    const result = (await response.json()) as
      | AnimalsResponse
      | { error?: string };

    if (!response.ok) {
      throw new Error(
        "error" in result && result.error
          ? result.error
          : t("fetchAnimalsError")
      );
    }

    if (
      !("animals" in result) ||
      !Array.isArray(result.animals) ||
      typeof result.count !== "number"
    ) {
      throw new Error(t("invalidAnimalsResponse"));
    }

    return result;
  }, [t]);

  useEffect(() => {
    const controller = new AbortController();

    const loadInitialAnimals = async () => {
      try {
        const result = await fetchAnimals(controller.signal);

        if (controller.signal.aborted) return;

        setAnimals(result.animals);
        setCount(result.count);
        setError(null);
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error ? err.message : t("genericFetchError")
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadInitialAnimals();

    return () => {
      controller.abort();
    };
  }, [fetchAnimals, t]);

  const refreshAnimals = useCallback(async () => {
    requestController.current?.abort();

    const controller = new AbortController();
    requestController.current = controller;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchAnimals(controller.signal);

      if (controller.signal.aborted) return;

      setAnimals(result.animals);
      setCount(result.count);
    } catch (err) {
      if (controller.signal.aborted) return;

      setError(
        err instanceof Error ? err.message : t("genericFetchError")
      );
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [fetchAnimals, t]);

  const availableStatuses = useMemo(
    () => [...new Set(animals.map((animal) => animal.status))].sort(),
    [animals]
  );

  const speciesCounts = useMemo(() => {
    const counts = { cattle: 0, sheep: 0, goat: 0 };

    for (const animal of animals) {
      const species = animal.species.toLowerCase();

      if (species === "cattle") counts.cattle += 1;
      if (species === "sheep") counts.sheep += 1;
      if (species === "goat") counts.goat += 1;
    }

    return counts;
  }, [animals]);

  const filteredAnimals = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return animals.filter((animal) => {
      const matchesStatus = !status || animal.status === status;
      const searchableText = [
        animal.id,
        animal.species,
        animal.sex,
        animal.breed,
        animal.status,
        animal.site_name ?? ""
      ].join(" ").toLowerCase();

      return (
        matchesStatus &&
        (!normalizedQuery || searchableText.includes(normalizedQuery))
      );
    });
  }, [animals, query, status]);

  const displayCode = (value: string) => {
    const key = value.toLowerCase().replaceAll("-", "_") as
      | "active" | "sold" | "deceased" | "transferred"
      | "quarantined" | "sick" | "cattle" | "sheep" | "goat" | "other";

    const knownKeys = [
      "active", "sold", "deceased", "transferred",
      "quarantined", "sick", "cattle", "sheep", "goat", "other"
    ];

    if (knownKeys.includes(key)) return t(key);
    return value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <main className="content">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="eyebrow">{t("moduleEyebrow")}</div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {t("animals")}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {t("animalsSubtitle")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <AnimalForm />
          <button
            type="button"
            onClick={refreshAnimals}
            disabled={loading}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? t("loading") : t("refresh")}
          </button>
        </div>
      </div>

      <section className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">{t("totalAnimals")}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {loading ? "—" : formatNumber(count)}
          </p>
          <p className="mt-1 text-xs text-slate-400">{t("backendCount")}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">{t("filteredCount")}</p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">
            {loading ? "—" : formatNumber(filteredAnimals.length)}
          </p>
          <p className="mt-1 text-xs text-slate-400">{t("currentResults")}</p>
        </div>
      </section>

      <section className="mb-6 grid gap-3 sm:grid-cols-3">
        {([
          { key: "cattle", label: t("cattle"), count: speciesCounts.cattle },
          { key: "sheep", label: t("sheep"), count: speciesCounts.sheep },
          { key: "goat", label: t("goat"), count: speciesCounts.goat }
        ] as const).map((item) => (
          <div
            key={item.key}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4"
          >
            <img
              src={speciesIcon(item.key)!}
              alt=""
              width={42}
              height={42}
              className="h-11 w-11 object-contain"
            />
            <div>
              <p className="text-xs font-medium text-slate-500">{item.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {loading ? "—" : formatNumber(item.count)}
              </p>
            </div>
          </div>
        ))}
      </section>

      <section className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("searchAnimals")}
          className="input min-w-[220px] flex-1"
          aria-label={t("searchLabel")}
        />

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="input min-w-[160px]"
          aria-label={t("filterStatus")}
        >
          <option value="">{t("allStatuses")}</option>
          {availableStatuses.map((item) => (
            <option key={item} value={item}>{displayCode(item)}</option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => {
            setQuery("");
            setStatus("");
          }}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          {t("resetFilters")}
        </button>
      </section>

      {error && (
        <section className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-800">
            {t("animalsLoadError")}
          </p>
          <p className="mt-1 text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={refreshAnimals}
            className="mt-3 text-sm font-semibold text-red-800 underline"
          >
            {t("retry")}
          </button>
        </section>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 p-5">
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              {t("registeredAnimals")}
            </h2>
            <p className="mt-1 text-xs text-slate-500">{t("animalDetails")}</p>
          </div>
          <span className="text-xs text-slate-400">{t("readOnly")}</span>
        </div>

        {loading && animals.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            {t("fetchingAnimals")}
          </div>
        ) : !error && filteredAnimals.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            {animals.length === 0 ? t("noAnimals") : t("noFilterMatches")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">{t("id")}</th>
                  <th className="px-5 py-3 font-semibold">{t("species")}</th>
                  <th className="px-5 py-3 font-semibold">{t("breed")}</th>
                  <th className="px-5 py-3 font-semibold">{t("sex")}</th>
                  <th className="px-5 py-3 font-semibold">{t("birthDate")}</th>
                  <th className="px-5 py-3 font-semibold">{t("status")}</th>
                  <th className="px-5 py-3 font-semibold">{t("location")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAnimals.map((animal) => (
                  <tr key={animal.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-slate-600">{animal.id}</td>
                    <td className="px-5 py-3 font-medium text-slate-800">
                      <span className="inline-flex items-center gap-2">
                        {speciesIcon(animal.species) && (
                          <img
                            src={speciesIcon(animal.species)!}
                            alt=""
                            width={30}
                            height={30}
                            loading="lazy"
                            className="h-8 w-8 object-contain"
                          />
                        )}
                        <span>{displayCode(animal.species)}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{animal.breed || "—"}</td>
                    <td className="px-5 py-3 text-slate-600">
                      {animal.sex === "male" ? t("male") : animal.sex === "female" ? t("female") : "—"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-slate-600">{formatDate(animal.date_of_birth)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(animal.status)}`}>
                        {displayCode(animal.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{animal.site_name || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="mt-4 text-xs text-slate-400">{t("sourceNote")}</p>
    </main>
  );
}
