"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";

type Species = "cattle" | "sheep" | "goat" | "other";

type Breed = {
  id: number;
  species: string;
  breed: string;
  primary_purpose: string;
};

type Site = {
  id: string;
  name: string;
  site_type: string;
  status: string;
  timezone: string;
};

type BreedsResponse = { count: number; breeds: Breed[] };
type SitesResponse = { count: number; sites: Site[] };

export function AnimalForm() {
  const { t, formatNumber } = useI18n();
  const [open, setOpen] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [optionsLoaded, setOptionsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [species, setSpecies] = useState<Species | "">("");
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [sites, setSites] = useState<Site[]>([]);

  async function openForm() {
    setOpen(true);
    setError(null);
    if (optionsLoaded || loadingOptions) return;

    setLoadingOptions(true);
    try {
      const [breedsResponse, sitesResponse] = await Promise.all([
        fetch("/api/livestock-breeds", {
          cache: "no-store",
          headers: { Accept: "application/json" }
        }),
        fetch("/api/sites", {
          cache: "no-store",
          headers: { Accept: "application/json" }
        })
      ]);

      const [breedsPayload, sitesPayload] = await Promise.all([
        breedsResponse.json(),
        sitesResponse.json()
      ]);

      if (!breedsResponse.ok) {
        throw new Error(breedsPayload?.error ?? t("breedLoadError"));
      }
      if (!sitesResponse.ok) {
        throw new Error(sitesPayload?.error ?? t("siteLoadError"));
      }

      const breedData = breedsPayload as BreedsResponse;
      const siteData = sitesPayload as SitesResponse;

      if (!Array.isArray(breedData.breeds) || !Array.isArray(siteData.sites)) {
        throw new Error(t("invalidMaster"));
      }

      setBreeds(breedData.breeds);
      setSites(siteData.sites.filter((site) => site.status === "active"));
      setOptionsLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("formOptionsError"));
    } finally {
      setLoadingOptions(false);
    }
  }

  const availableBreeds = breeds.filter((item) => item.species === species);

  const speciesOptions: { value: Species; label: string }[] = [
    { value: "cattle", label: t("cattle") },
    { value: "sheep", label: t("sheep") },
    { value: "goat", label: t("goat") },
    { value: "other", label: t("other") }
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => void openForm()}
        className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        {t("previewForm")}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <section className="my-auto w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{t("registration")}</h2>
                <p className="mt-1 text-xs text-slate-500">{t("previewDescription")}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-1 text-sm text-slate-500 hover:bg-slate-100"
                aria-label={t("close")}
              >
                {t("close")}
              </button>
            </div>

            {loadingOptions && (
              <p className="mt-5 text-sm text-slate-500">{t("loadingMaster")}</p>
            )}

            {error && (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
                <button
                  type="button"
                  onClick={() => {
                    setOptionsLoaded(false);
                    void openForm();
                  }}
                  className="ml-2 font-semibold underline"
                >
                  {t("retry")}
                </button>
              </div>
            )}

            <form
              onSubmit={(event) => event.preventDefault()}
              className="mt-5 grid gap-4 sm:grid-cols-2"
            >
              <Field label={t("tagNumber")} required>
                <input name="tagNumber" required minLength={2} placeholder={t("exampleTag")} className="input" disabled />
              </Field>

              <Field label={t("species")} required>
                <select
                  name="species"
                  required
                  value={species}
                  onChange={(event) => setSpecies(event.target.value as Species | "")}
                  className="input"
                  disabled={loadingOptions || !optionsLoaded}
                >
                  <option value="">{t("chooseSpecies")}</option>
                  {speciesOptions.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </Field>

              <Field label={t("breed")}>
                <select
                  name="breed"
                  className="input"
                  disabled={!species || species === "other" || loadingOptions || !optionsLoaded}
                  defaultValue=""
                >
                  <option value="">
                    {species === "other"
                      ? t("otherSpeciesUnavailable")
                      : species
                        ? t("chooseBreed")
                        : t("chooseSpeciesFirst")}
                  </option>
                  {availableBreeds.map((item) => (
                    <option key={item.id} value={item.breed}>
                      {item.breed} — {item.primary_purpose}
                    </option>
                  ))}
                </select>
                {species && species !== "other" && optionsLoaded && (
                  <span className="mt-1 block text-xs text-slate-400">
                    {formatNumber(availableBreeds.length)} {t("breedsAvailable")}
                  </span>
                )}
              </Field>

              <Field label={t("sex")} required>
                <select name="sex" required className="input" disabled>
                  <option value="">{t("chooseSex")}</option>
                  <option value="male">{t("male")}</option>
                  <option value="female">{t("female")}</option>
                </select>
              </Field>

              <Field label={t("birthDate")}>
                <input name="birthDate" type="date" className="input" disabled />
              </Field>

              <Field label={t("farmSite")} required>
                <select
                  name="siteId"
                  required
                  className="input"
                  defaultValue=""
                  disabled={loadingOptions || !optionsLoaded}
                >
                  <option value="">{t("chooseLocation")}</option>
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>{site.name}</option>
                  ))}
                </select>
                {optionsLoaded && (
                  <span className="mt-1 block text-xs text-slate-400">
                    {formatNumber(sites.length)} {t("activeSitesAvailable")}
                  </span>
                )}
              </Field>

              <Field label={t("status")} required>
                <select name="status" defaultValue="active" className="input" disabled>
                  <option value="active">{t("active")}</option>
                  <option value="sold">{t("sold")}</option>
                  <option value="deceased">{t("deceased")}</option>
                  <option value="transferred">{t("transferred")}</option>
                </select>
              </Field>
            </form>

            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm font-semibold text-amber-800">{t("previewMode")}</p>
              <p className="mt-1 text-xs text-amber-700">{t("previewWarning")}</p>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                disabled
                title={t("waitingBackend")}
                className="cursor-not-allowed rounded-md bg-slate-300 px-4 py-2 text-sm font-medium text-slate-600"
              >
                {t("saveUnavailable")}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function Field({
  label,
  required,
  children
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-slate-700">
        {label} {required && <span className="text-red-600">*</span>}
      </span>
      {children}
    </label>
  );
}
