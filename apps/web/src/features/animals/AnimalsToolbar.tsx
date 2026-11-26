"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AnimalsToolbar({
  initialQ,
  initialStatus,
}: {
  initialQ: string;
  initialStatus: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);
  const [status, setStatus] = useState(initialStatus);

  function apply() {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (status) sp.set("status", status);
    router.push(`/animals${sp.toString() ? `?${sp}` : ""}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && apply()}
        placeholder="Cari tag, spesies, ras…"
        className="input w-64"
      />
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="input"
      >
        <option value="">Semua status</option>
        <option value="active">Aktif</option>
        <option value="sick">Sakit</option>
        <option value="quarantined">Karantina</option>
        <option value="deceased">Mati</option>
      </select>
      <button
        onClick={apply}
        className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800"
      >
        Cari
      </button>
    </div>
  );
}