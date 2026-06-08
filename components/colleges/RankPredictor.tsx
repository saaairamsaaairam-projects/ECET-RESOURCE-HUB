"use client";

import { useMemo, useState } from "react";
import type { EcetBranchData } from "@/lib/colleges/types";

interface RankPredictorProps {
  collegeName: string;
  data: EcetBranchData[];
}

function getLatestCutoff(entry: EcetBranchData) {
  const values = [entry.cutoff2023, entry.cutoff2024, entry.cutoff2025]
    .map((value) => (value ? Number(value) : Number.NaN))
    .filter((value) => !Number.isNaN(value));

  return values.length > 0 ? Math.min(...values) : null;
}

function getChanceLabel(rank: number, cutoff: number | null) {
  if (cutoff === null) {
    return "Data unavailable";
  }

  const ratio = rank / cutoff;

  if (ratio <= 0.9) {
    return "Very High";
  }

  if (ratio <= 1.05) {
    return "High";
  }

  if (ratio <= 1.25) {
    return "Medium";
  }

  return "Needs review";
}

export default function RankPredictor({ collegeName, data }: RankPredictorProps) {
  const [rank, setRank] = useState(1450);

  const predictions = useMemo(() =>
    data.map((entry) => {
      const cutoff = getLatestCutoff(entry);
      return {
        ...entry,
        cutoff,
        chance: getChanceLabel(rank, cutoff),
      };
    }),
  [data, rank]);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20 backdrop-blur-xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-purple-200">ECET Rank Predictor</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Estimate your chances at {collegeName}</h2>
          <p className="mt-2 text-sm text-gray-300">Lower ranks are better. The score below compares your expected position with recent ECET closing ranks.</p>
        </div>

        <label className="w-full max-w-xs rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-gray-100 md:w-72">
          <span className="mb-2 block text-gray-200">Enter your ECET rank</span>
          <input
            type="number"
            min="1"
            value={rank}
            onChange={(event) => setRank(Number(event.target.value) || 1)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none"
          />
        </label>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {predictions.map((entry) => (
          <article key={entry.branch} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm uppercase tracking-[0.25em] text-purple-200">{entry.branch}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{entry.chance}</p>
            <p className="mt-2 text-sm text-gray-300">Latest ECET closing rank: {entry.cutoff ?? "—"}</p>
            <p className="mt-1 text-xs text-gray-400">Based on recent closing-rank trends for this college.</p>
          </article>
        ))}
      </div>
    </section>
  );
}
