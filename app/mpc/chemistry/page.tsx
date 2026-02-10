"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const chemistryUnits = [
  { name: "Organic Chemistry", key: "mpc_chemistry_organic" },
  { name: "Inorganic Chemistry", key: "mpc_chemistry_inorganic" },
  { name: "Physical Chemistry", key: "mpc_chemistry_physical" },
  { name: "Short Notes & MCQs", key: "mpc_chemistry_mcqs" },
  { name: "Formulas", key: "mpc_chemistry_formulas" },
  { name: "Previous Papers", key: "mpc_chemistry_papers" },
];

export default function ChemistryPage() {
  return (
    <div className="min-h-screen bg-[#0f0e17] pt-24 px-6 text-white">

      <h1 className="text-4xl font-extrabold mb-10 bg-gradient-to-r from-green-300 to-emerald-300 text-transparent bg-clip-text">
        Chemistry – Chapters
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {chemistryUnits.map((u, i) => (
          <motion.div
            key={u.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ scale: 1.05 }}
            className="p-8 bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl hover:border-purple-400 hover:shadow-xl transition"
          >
            <Link href={`/redirect?key=${u.key}`}>
              <h2 className="text-xl font-semibold">{u.name}</h2>
            </Link>
          </motion.div>
        ))}
      </div>

    </div>
  );
}
