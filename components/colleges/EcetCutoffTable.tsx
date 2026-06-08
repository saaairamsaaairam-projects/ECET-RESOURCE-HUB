import type { EcetBranchData } from "@/lib/colleges/types";

interface EcetCutoffTableProps {
  data: EcetBranchData[];
}

export default function EcetCutoffTable({ data }: EcetCutoffTableProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20 backdrop-blur-xl">
      <h2 className="text-xl font-semibold text-white">ECET Lateral Entry Information</h2>
      <p className="mt-2 text-gray-300">Use these cutoff trends to compare branch-wise demand at a glance.</p>

      <div className="mt-5 overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-full divide-y divide-white/10 text-left text-sm text-gray-100">
          <thead className="bg-black/20 text-gray-200">
            <tr>
              <th className="px-4 py-3">Branch</th>
              <th className="px-4 py-3">2023</th>
              <th className="px-4 py-3">2024</th>
              <th className="px-4 py-3">2025</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 bg-white/5">
            {data.map((entry) => (
              <tr key={entry.branch}>
                <td className="px-4 py-3 font-medium text-white">{entry.branch}</td>
                <td className="px-4 py-3">{entry.cutoff2023 ?? "—"}</td>
                <td className="px-4 py-3">{entry.cutoff2024 ?? "—"}</td>
                <td className="px-4 py-3">{entry.cutoff2025 ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
