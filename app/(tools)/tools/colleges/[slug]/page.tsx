import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import BranchesSection from "@/components/colleges/BranchesSection";
import CompareButton from "@/components/colleges/CompareButton";
import CollegeGallery from "@/components/colleges/CollegeGallery";
import CollegeCutoffSection from "@/components/colleges/CollegeCutoffSection";
import CollegeStatCard from "@/components/colleges/CollegeStatCard";
import { getCollegeBySlug } from "@/lib/colleges/queries";

interface CollegeDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CollegeDetailPage({ params }: CollegeDetailPageProps) {
  const { slug } = await params;
  const college = await getCollegeBySlug(slug);

  if (!college) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#0f0e17] px-6 py-24 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <Image src={college.images.cover} alt={college.name} width={1600} height={900} unoptimized className="h-72 w-full object-cover md:h-80" />
          <div className="space-y-6 p-6 md:p-8">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.25em] text-purple-300">Tools / Colleges</p>
              <h1 className="text-4xl font-bold text-white md:text-5xl">{college.name}</h1>
              <p className="text-lg text-gray-200">{college.location}</p>
              <p className="text-gray-300">{college.university}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <CollegeStatCard label="Average Package" value={college.placements.averagePackage} accent="purple" />
              <CollegeStatCard label="Highest Package" value={college.placements.highestPackage} accent="teal" />
              <CollegeStatCard label="NAAC Grade" value={college.naacGrade} accent="amber" />
              <CollegeStatCard label="Autonomous" value={college.autonomous ? "Yes" : "No"} accent="purple" />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <article className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-purple-200">Verification</p>
                <p className="mt-2 text-lg font-semibold text-white">{college.verificationStatus ?? "Verified"}</p>
                <p className="text-sm text-gray-300">{college.lastVerified ? `Last verified: ${college.lastVerified}` : "Freshly imported data"}</p>
              </article>
              <article className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-purple-200">Best Branches</p>
                <p className="mt-2 text-lg font-semibold text-white">{college.branches.slice(0, 3).join(" • ") || "See details below"}</p>
                <p className="text-sm text-gray-300">Useful for students comparing branch strength quickly.</p>
              </article>
              <article className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-purple-200">Official Links</p>
                <p className="mt-2 text-sm text-gray-200">{college.website ? <Link href={college.website} target="_blank" rel="noreferrer" className="text-purple-200 underline">Visit official website</Link> : "Website not available"}</p>
                <p className="text-sm text-gray-300">Keep the college profile grounded in official sources.</p>
              </article>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-200">
              <span className="rounded-full bg-white/10 px-3 py-1">Fees: {college.fees.tuition}</span>
              <span className="rounded-full bg-white/10 px-3 py-1">University: {college.university}</span>
              <Link href={college.website} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 px-4 py-2 font-semibold text-white transition hover:opacity-90">
                Visit Website
              </Link>
              <CompareButton collegeId={college.id} label="Add to Compare" />
              <Link href="/tools/colleges/compare" className="inline-flex items-center justify-center rounded-xl border border-purple-400/40 bg-purple-500/10 px-4 py-2 font-semibold text-purple-100 transition hover:bg-purple-500/20">
                Compare Now
              </Link>
            </div>

            <p className="max-w-3xl text-gray-300">{college.description}</p>
          </div>
        </section>

        <CollegeGallery college={college} />

        <CollegeCutoffSection college={college} />

        <div className="grid gap-6 md:grid-cols-1">
          <BranchesSection college={college} />
        </div>

        <section className="grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20 backdrop-blur-xl">
            <h2 className="text-xl font-semibold text-white">Why choose this college?</h2>
            <p className="mt-4 text-gray-200">{college.description}</p>
            <p className="mt-4 text-sm text-gray-300">This section is now focused on student-relevant decisions: placements, campus life, fees, and accreditation.</p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20 backdrop-blur-xl">
            <h2 className="text-xl font-semibold text-white">Placement Highlights</h2>
            <ul className="mt-4 space-y-3 text-gray-200">
              <li><span className="text-gray-300">Average Package:</span> {college.placements.averagePackage}</li>
              <li><span className="text-gray-300">Highest Package:</span> {college.placements.highestPackage}</li>
              <li><span className="text-gray-300">Recruiters:</span> {college.placements.recruiters.join(", ")}</li>
            </ul>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20 backdrop-blur-xl">
            <h2 className="text-xl font-semibold text-white">Fees</h2>
            <ul className="mt-4 space-y-3 text-gray-200">
              <li><span className="text-gray-300">Tuition:</span> {college.fees.tuition}</li>
              <li><span className="text-gray-300">Hostel:</span> {college.fees.hostel}</li>
              <li><span className="text-gray-300">Transport:</span> {college.fees.transport}</li>
            </ul>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20 backdrop-blur-xl">
            <h2 className="text-xl font-semibold text-white">Facilities Overview</h2>
            <div className="mt-4 flex flex-wrap gap-2 text-sm text-gray-100">
              {college.facilities.map((facility) => (
                <span key={facility} className="rounded-full bg-white/10 px-3 py-1">{facility}</span>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20 backdrop-blur-xl">
            <h2 className="text-xl font-semibold text-white">Student Insights</h2>
            <ul className="mt-4 space-y-3 text-gray-200">
              {Object.entries(college.studentInsights ?? {}).map(([key, value]) => (
                <li key={key} className="rounded-xl border border-white/8 bg-black/10 p-3">
                  <p className="text-sm uppercase tracking-[0.2em] text-purple-200">{key.replace(/([A-Z])/g, " $1")}</p>
                  <p className="mt-1 text-gray-300">{value}</p>
                </li>
              ))}
            </ul>
          </article>
        </section>
      </div>
    </main>
  );
}
