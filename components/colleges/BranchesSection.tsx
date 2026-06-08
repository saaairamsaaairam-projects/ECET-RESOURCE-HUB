import type { College } from "@/lib/colleges/types";

interface BranchesSectionProps {
  college: College;
}

export default function BranchesSection({ college }: BranchesSectionProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20 backdrop-blur-xl">
      <h2 className="text-xl font-semibold text-white">Branches Offered</h2>
      <p className="mt-2 text-gray-300">Quickly check whether the college supports your preferred branch for ECET lateral entry.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        {college.branches.map((branch) => (
          <span key={branch} className="rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-100">
            {branch}
          </span>
        ))}
      </div>
    </section>
  );
}
