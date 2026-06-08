"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CollegeGrid from "@/components/colleges/CollegeGrid";
import SearchBar from "@/components/colleges/SearchBar";
import { useCompareColleges } from "@/context/CompareCollegesContext";
import { filterColleges, getAllColleges, searchColleges } from "@/lib/colleges/queries";

export default function CollegesPage() {
  const { selectedColleges, clearSelection } = useCompareColleges();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "autonomous" | "non-autonomous" | "A+" | "A" | "Guntur" | "Vijayawada" | "Visakhapatnam">("all");

  const [colleges, setColleges] = useState<Awaited<ReturnType<typeof getAllColleges>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      const base = query.trim() ? await searchColleges(query) : await getAllColleges();
      const filters = {
        autonomous: activeFilter === "autonomous" ? true : activeFilter === "non-autonomous" ? false : undefined,
        naacGrade: activeFilter === "A+" || activeFilter === "A" ? activeFilter : undefined,
        district: ["Guntur", "Vijayawada", "Visakhapatnam"].includes(activeFilter) ? activeFilter : undefined,
      };

      const filtered = await filterColleges(filters);
      const result = filtered.filter((college) => base.some((item) => item.id === college.id));

      if (mounted) {
        setColleges(result);
        setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [query, activeFilter]);

  const chips = [
    { label: "All", value: "all" },
    { label: "Autonomous", value: "autonomous" },
    { label: "Non-Autonomous", value: "non-autonomous" },
    { label: "NAAC A+", value: "A+" },
    { label: "NAAC A", value: "A" },
    { label: "Guntur", value: "Guntur" },
    { label: "Vijayawada", value: "Vijayawada" },
    { label: "Visakhapatnam", value: "Visakhapatnam" },
  ] as const;

  return (
    <main className="min-h-screen bg-[#0f0e17] px-6 py-24 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <section className="space-y-5 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-purple-300">Tools / Colleges</p>
          <h1 className="text-4xl font-bold text-white md:text-5xl">Explore Engineering Colleges</h1>
          <p className="mx-auto max-w-3xl text-gray-300 text-lg">
            Find the best engineering colleges for ECET lateral entry students with placements, fees, and real student insights.
          </p>
        </section>

        <SearchBar value={query} onChange={setQuery} />

        {selectedColleges.length > 0 ? (
          <section className="rounded-2xl border border-purple-400/30 bg-gradient-to-r from-purple-500/10 via-violet-500/10 to-transparent p-5 shadow-lg shadow-black/20 backdrop-blur-xl">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-purple-200">Compare shortlist</p>
                <h2 className="text-xl font-semibold text-white">{selectedColleges.length} college{selectedColleges.length === 1 ? "" : "s"} ready for side-by-side comparison</h2>
                <p className="text-sm text-gray-300">Pick two colleges and open the compare view for fees, placements, branches, and facilities.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/tools/colleges/compare" className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90">Compare Now</Link>
                <button type="button" onClick={clearSelection} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:border-purple-400/40 hover:bg-white/10">Clear</button>
              </div>
            </div>
          </section>
        ) : null}

        <section className="flex flex-wrap gap-2">
          {chips.map((chip) => {
            const active = activeFilter === chip.value;
            return (
              <button
                key={chip.value}
                type="button"
                onClick={() => setActiveFilter(chip.value)}
                className={`rounded-full border px-3 py-2 text-sm transition ${active ? "border-purple-400 bg-purple-500/20 text-white" : "border-white/10 bg-white/5 text-gray-200 hover:border-purple-400/40"}`}
              >
                {chip.label}
              </button>
            );
          })}
        </section>

        <p className="text-sm text-gray-300">{loading ? "Loading colleges..." : query.trim() ? `Showing ${colleges.length} colleges for "${query.trim()}"` : `Showing ${colleges.length} colleges`}</p>

        {loading ? (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-gray-300 shadow-lg shadow-black/20 backdrop-blur-xl">
            Loading colleges from Supabase...
          </section>
        ) : colleges.length === 0 ? (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-lg shadow-black/20 backdrop-blur-xl">
            <h2 className="text-2xl font-semibold text-white">No colleges found</h2>
            <p className="mt-2 text-gray-300">Try searching for VVIT, Vignan, GVP, ANITS, or CSE.</p>
          </section>
        ) : (
          <section>
            <CollegeGrid colleges={colleges} />
          </section>
        )}
      </div>
    </main>
  );
}
