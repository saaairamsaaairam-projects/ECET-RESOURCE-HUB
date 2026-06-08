interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/20 backdrop-blur-xl">
      <label className="mb-2 block text-sm text-gray-200">Search colleges</label>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Try: VVIT, Vignan, GVP, CSE, Guntur"
        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-gray-400 outline-none ring-0"
      />
      <p className="mt-2 text-xs text-gray-300">Results are ranked by exact name, district, university, and branch relevance.</p>
    </section>
  );
}
