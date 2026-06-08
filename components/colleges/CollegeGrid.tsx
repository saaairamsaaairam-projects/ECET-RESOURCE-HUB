import type { College } from "@/lib/colleges/types";
import CollegeCard from "@/components/colleges/CollegeCard";

interface CollegeGridProps {
  colleges: College[];
}

export default function CollegeGrid({ colleges }: CollegeGridProps) {
  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {colleges.map((college) => (
        <CollegeCard key={college.id} college={college} />
      ))}
    </section>
  );
}
