"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const mathsUnits = [
  { name: "Unit 1 – Trigonometry", key: "mpc_maths_unit1" },
  { name: "Unit 2 – Algebra", key: "mpc_maths_unit2" },
  { name: "Unit 3 – Calculus", key: "mpc_maths_unit3" },
  { name: "Unit 4 – Coordinate Geometry", key: "mpc_maths_unit4" },
  { name: "Unit 5 – Vector Algebra", key: "mpc_maths_unit5" },
  { name: "Bit Bank", key: "mpc_maths_bits" },
  { name: "Formulas", key: "mpc_maths_formulas" },
  { name: "Previous Papers", key: "mpc_maths_papers" },
];

export default function MathsPage() {
  return (
    <div className="min-h-screen bg-[#0f0e17] pt-24 px-6 text-white">

      <h1 className="text-4xl font-extrabold mb-10 bg-gradient-to-r from-purple-300 to-cyan-300 text-transparent bg-clip-text">
        Mathematics – Chapters
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {mathsUnits.map((u, i) => (
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
