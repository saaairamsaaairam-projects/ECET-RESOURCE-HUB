"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCompareColleges } from "@/context/CompareCollegesContext";
import type { College } from "@/lib/colleges/types";
import { getAllColleges } from "@/lib/colleges/queries";

export default function CompareCollegesPage() {
  const { selectedColleges, clearSelection } = useCompareColleges();
  const [colleges, setColleges] = useState<College[]>([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const allColleges = await getAllColleges();
      if (mounted) {
        setColleges(allColleges.filter((college) => selectedColleges.includes(college.id)));
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [selectedColleges]);

  const hasEnough = colleges.length === 2;

  return (
    <main className="min-h-screen bg-[#0f0e17] px-6 py-24 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-purple-300">Tools / Colleges</p>
          <h1 className="text-4xl font-bold text-white md:text-5xl">Compare Colleges</h1>
          <p className="mx-auto max-w-3xl text-gray-300">Select up to two colleges to compare fees, placements, NAAC grade, and branch strengths side by side.</p>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/20 backdrop-blur-xl">
          <div>
            <p className="text-sm text-purple-200">Selected colleges</p>
            <p className="text-sm text-gray-300">{colleges.length}/2 chosen</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/tools/colleges" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:border-purple-400/40 hover:bg-white/10">Back to Explorer</Link>
            <button type="button" onClick={clearSelection} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:border-purple-400/40 hover:bg-white/10">Clear</button>
          </div>
        </div>

        {!hasEnough ? (
          <section className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center shadow-lg shadow-black/20 backdrop-blur-xl">
            <h2 className="text-2xl font-semibold text-white">Choose two colleges</h2>
            <p className="mt-2 text-gray-300">Head back to the explorer, pick two colleges, and then return here to compare them.</p>
          </section>
        ) : (
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10 text-left text-sm text-gray-100">
                <thead className="bg-black/20 text-gray-200">
                  <tr>
                    <th className="px-4 py-3">Metric</th>
                    {colleges.map((college) => (
                      <th key={college.id} className="px-4 py-3 align-top">
                        <p className="text-xs uppercase tracking-[0.25em] text-purple-200">{college.district}</p>
                        <p className="mt-1 text-base font-semibold text-white">{college.name}</p>
                        <p className="text-xs text-gray-300">{college.university}</p>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  <tr>
                    <td className="px-4 py-3 font-semibold text-white">NAAC</td>
                    {colleges.map((college) => <td key={`${college.id}-naac`} className="px-4 py-3">{college.naacGrade}</td>)}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-white">Autonomous</td>
                    {colleges.map((college) => <td key={`${college.id}-auto`} className="px-4 py-3">{college.autonomous ? "Yes" : "No"}</td>)}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-white">Average Package</td>
                    {colleges.map((college) => <td key={`${college.id}-avg`} className="px-4 py-3">{college.placements.averagePackage}</td>)}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-white">Highest Package</td>
                    {colleges.map((college) => <td key={`${college.id}-high`} className="px-4 py-3">{college.placements.highestPackage}</td>)}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-white">Tuition Fees</td>
                    {colleges.map((college) => <td key={`${college.id}-fees`} className="px-4 py-3">{college.fees.tuition}</td>)}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-white">Hostel Fee</td>
                    {colleges.map((college) => <td key={`${college.id}-hostel`} className="px-4 py-3">{college.fees.hostel}</td>)}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-white">Top Branches</td>
                    {colleges.map((college) => (
                      <td key={`${college.id}-branches`} className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">{college.branches.slice(0, 4).map((branch: string) => <span key={branch} className="rounded-full bg-white/10 px-3 py-1 text-xs">{branch}</span>)}</div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-white">Facilities</td>
                    {colleges.map((college) => (
                      <td key={`${college.id}-facilities`} className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">{college.facilities.slice(0, 5).map((facility: string) => <span key={facility} className="rounded-full bg-white/10 px-3 py-1 text-xs">{facility}</span>)}</div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
