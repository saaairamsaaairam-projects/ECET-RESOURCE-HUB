import type { College } from "@/lib/colleges/types";

interface CollegeCutoffSectionProps {
  college: College;
}

export default function CollegeCutoffSection({ college }: CollegeCutoffSectionProps) {
  const cutoffs = college.ecetData?.filter((item) => item.branch || item.cutoff2023 || item.cutoff2024 || item.cutoff2025) ?? [];

  if (cutoffs.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">ECET Cutoff Snapshot</h2>
          <p className="mt-2 text-gray-300">Branch-wise closing ranks from the current college dataset, ready for student comparison.</p>
        </div>
        <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-purple-200">Excel-ready</span>
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10 bg-black/10">
        <table className="min-w-full text-left text-sm text-gray-100">
          <thead className="bg-black/20 text-gray-200">
            <tr>
              <th className="px-4 py-3">Branch</th>
              <th className="px-4 py-3">2023</th>
              <th className="px-4 py-3">2024</th>
              <th className="px-4 py-3">2025</th>
            </tr>
          </thead>
          <tbody>
            {cutoffs.map((item) => (
              <tr key={item.branch} className="border-t border-white/10">
                <td className="px-4 py-3 font-semibold text-white">{item.branch}</td>
                <td className="px-4 py-3">{item.cutoff2023 || "—"}</td>
                <td className="px-4 py-3">{item.cutoff2024 || "—"}</td>
                <td className="px-4 py-3">{item.cutoff2025 || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
