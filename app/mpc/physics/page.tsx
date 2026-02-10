"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const physicsUnits = [
  { name: "Unit 1 – Mechanics", key: "mpc_physics_unit1" },
  { name: "Unit 2 – Waves & Oscillations", key: "mpc_physics_unit2" },
  { name: "Unit 3 – Thermodynamics", key: "mpc_physics_unit3" },
  { name: "Unit 4 – Electricity & Magnetism", key: "mpc_physics_unit4" },
  { name: "Unit 5 – Modern Physics", key: "mpc_physics_unit5" },
  { name: "Important Derivations", key: "mpc_physics_derivations" },
  { name: "Problems & Solutions", key: "mpc_physics_problems" },
  { name: "Previous Papers", key: "mpc_physics_papers" },
];

export default function PhysicsPage() {
  return (
    <div className="min-h-screen bg-[#0f0e17] pt-24 px-6 text-white">

      <h1 className="text-4xl font-extrabold mb-10 bg-gradient-to-r from-blue-300 to-cyan-300 text-transparent bg-clip-text">
        Physics – Chapters
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {physicsUnits.map((u, i) => (
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
