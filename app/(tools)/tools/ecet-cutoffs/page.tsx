import Link from "next/link";

export default function EcetCutoffsPage() {
  return (
    <main className="min-h-screen bg-[#0f0e17] px-6 py-24 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <section className="space-y-4">
          <p className="text-sm uppercase tracking-[0.25em] text-purple-300">PolyHub Tools</p>
          <h1 className="text-4xl font-bold text-white md:text-5xl">ECET Cutoff Explorer</h1>
          <p className="max-w-3xl text-gray-300">
            This is the dedicated counselling-data module. It keeps cutoff search and rank analysis separate from the evergreen College Explorer experience.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20 backdrop-blur-xl">
            <h2 className="text-2xl font-semibold text-white">Planned search filters</h2>
            <ul className="mt-4 space-y-3 text-gray-200">
              <li>Year</li>
              <li>College</li>
              <li>Branch</li>
              <li>Category</li>
              <li>Gender</li>
            </ul>
            <p className="mt-4 text-sm text-gray-300">The output is designed for opening/closing rank lookups and future predictor integration.</p>
          </article>

          <article className="rounded-3xl border border-dashed border-purple-400/30 bg-gradient-to-br from-purple-500/10 to-violet-500/10 p-6 shadow-lg shadow-black/20 backdrop-blur-xl">
            <h2 className="text-2xl font-semibold text-white">Phase 2 scope</h2>
            <p className="mt-3 text-gray-200">
              Once the cutoff dataset is ready, this screen will power direct counselling lookups and feed the future rank predictor.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/tools/colleges" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:border-purple-400/40 hover:bg-white/10">Return to College Explorer</Link>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
