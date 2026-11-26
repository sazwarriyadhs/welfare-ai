
"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { AnimalModel } from "../../generated/prisma/models/Animal";

export function AnimalTable({
  animals,
}: {
  animals: AnimalModel[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Hapus hewan ini?")) return;

    setDeletingId(id);

    try {
      const res = await fetch(`/api/animals/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("Gagal menghapus.");
        return;
      }

      start(() => router.refresh());
    } catch (error) {
      console.error("Animal deletion failed:", error);
      alert("Terjadi kesalahan saat menghapus hewan.");
    } finally {
      setDeletingId(null);
    }
  }

  if (animals.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
        Belum ada data hewan. Tambahkan lewat tombol di atas.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-600">
          <tr>
            <th className="px-4 py-3">Tag</th>
            <th className="px-4 py-3">Spesies</th>
            <th className="px-4 py-3">Ras</th>
            <th className="px-4 py-3">Sex</th>
            <th className="px-4 py-3">Skor</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Lokasi</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {animals.map((a) => (
            <tr key={a.id}>
              <td className="px-4 py-3 font-medium text-slate-900">
                {a.tagNumber}
              </td>

              <td className="px-4 py-3 capitalize">{a.species}</td>

              <td className="px-4 py-3">{a.breed ?? "—"}</td>

              <td className="px-4 py-3">
                {a.sex === "male" ? "Jantan" : "Betina"}
              </td>

              <td className="px-4 py-3">{a.healthScore}</td>

              <td className="px-4 py-3">
                <span
                  className={
                    "inline-flex rounded-full px-2 py-0.5 text-xs font-medium " +
                    (a.status === "active"
                      ? "bg-emerald-50 text-emerald-700"
                      : a.status === "sick"
                        ? "bg-red-50 text-red-700"
                        : a.status === "quarantined"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-600")
                  }
                >
                  {a.status}
                </span>
              </td>

              <td className="px-4 py-3">{a.location ?? "—"}</td>

              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => handleDelete(a.id)}
                  disabled={deletingId !== null || pending}
                  className="rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {deletingId === a.id ? "Menghapus…" : "Hapus"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
