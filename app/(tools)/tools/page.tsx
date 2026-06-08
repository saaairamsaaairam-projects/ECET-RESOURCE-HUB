import Link from "next/link";

export default function ToolsPage() {
  return (
    <main className="min-h-screen bg-[#0f0e17] px-6 py-24 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <section className="space-y-4">
          <p className="text-sm uppercase tracking-[0.25em] text-purple-300">PolyHub Tools</p>
          <h1 className="text-4xl font-bold text-white md:text-5xl">Counseling and college discovery tools</h1>
          <p className="max-w-2xl text-gray-300">
            Start with College Explorer and build future counseling tools on top of the same structure.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <Link
            href="/tools/colleges"
            className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20 transition hover:-translate-y-1 hover:border-purple-400/60"
          >
            <h2 className="text-2xl font-semibold text-white">College Explorer</h2>
            <p className="mt-3 text-gray-300">Browse placements, fees, facilities, gallery, and compare colleges without cutoff noise.</p>
          </Link>

          <Link
            href="/tools/ecet-cutoffs"
            className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20 transition hover:-translate-y-1 hover:border-purple-400/60"
          >
            <h2 className="text-2xl font-semibold text-white">ECET Cutoff Explorer</h2>
            <p className="mt-3 text-gray-300">A dedicated counselling-data module for year, college, branch, category, and gender filters.</p>
          </Link>

          <article className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-gray-300">
            <h2 className="text-2xl font-semibold text-white">AI Recommendations</h2>
            <p className="mt-3">Future expansion for personalized counseling support.</p>
          </article>
        </section>
      </div>
    </main>
  );
}
