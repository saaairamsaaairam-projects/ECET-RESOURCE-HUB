interface CollegeStatCardProps {
  label: string;
  value: string;
  accent?: "purple" | "teal" | "amber";
}

export default function CollegeStatCard({ label, value, accent = "purple" }: CollegeStatCardProps) {
  const accentStyles = {
    purple: "border-purple-400/30 bg-purple-500/10 text-purple-100",
    teal: "border-cyan-400/30 bg-cyan-500/10 text-cyan-100",
    amber: "border-amber-400/30 bg-amber-500/10 text-amber-100",
  };

  return (
    <article className={`rounded-2xl border p-3 shadow-lg shadow-black/20 backdrop-blur-xl sm:p-4 ${accentStyles[accent]}`}>
      <p className="text-[10px] uppercase tracking-[0.25em] text-gray-200 sm:text-xs">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white sm:text-2xl">{value}</p>
    </article>
  );
}
