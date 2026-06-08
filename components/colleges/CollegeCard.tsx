import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Building2, MapPin, IndianRupee } from "lucide-react";
import CompareButton from "@/components/colleges/CompareButton";
import type { College } from "@/lib/colleges/types";

interface CollegeCardProps {
  college: College;
}

export default function CollegeCard({ college }: CollegeCardProps) {
  const imageSrc = college.images?.cover ?? college.images?.gallery?.[0] ?? "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=80";
  const topBranches = college.branches.slice(0, 3);
  const topFacility = college.facilities?.[0];

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/20 backdrop-blur-xl transition hover:-translate-y-1 hover:border-purple-400/60 sm:p-5">
      <Image src={imageSrc} alt={college.name} width={900} height={640} unoptimized className="h-36 w-full rounded-xl object-cover sm:h-40" />

      <div className="mt-4 space-y-3 text-white">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-purple-200">{college.district}</p>
          <h3 className="mt-1 text-lg font-semibold text-white sm:text-xl">{college.name}</h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-gray-300 sm:text-sm"><MapPin className="h-3.5 w-3.5 text-purple-200" /> {college.location}</p>
        </div>

        <div className="flex flex-wrap gap-2 text-[11px] text-gray-100 sm:text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1"><BadgeCheck className="h-3 w-3 text-emerald-200" /> NAAC {college.naacGrade}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1"><Building2 className="h-3 w-3 text-cyan-200" /> {college.autonomous ? "Autonomous" : "Non-Autonomous"}</span>
        </div>

        <div className="space-y-1 text-xs text-gray-200 sm:text-sm">
          <p className="flex items-center gap-1"><span className="text-gray-300">Average Package:</span> {college.placements.averagePackage}</p>
          <p className="flex items-center gap-1"><IndianRupee className="h-3.5 w-3.5 text-amber-200" /> <span className="text-gray-300">Fees:</span> {college.fees.tuition}</p>
          {topFacility ? <p className="text-gray-200">Top Facility: {topFacility}</p> : null}
        </div>

        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.25em] text-purple-200">Top Branches</p>
          <div className="flex flex-wrap gap-2 text-[11px] text-gray-100 sm:text-xs">
            {topBranches.map((branch) => (
              <span key={branch} className="rounded-full bg-white/10 px-3 py-1">{branch}</span>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/tools/colleges/${college.slug}`}
            className="inline-flex flex-1 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-violet-600 px-4 py-2 font-semibold text-white transition hover:opacity-90"
          >
            View Details
          </Link>
          <CompareButton collegeId={college.id} label="Compare" />
        </div>
      </div>
    </article>
  );
}
