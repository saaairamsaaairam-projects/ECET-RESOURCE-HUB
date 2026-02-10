"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const subjects = [
  {
    name: "Mathematics",
    desc: "Complete Units • Bit Banks • Formulas • Previous Papers",
    color: "from-purple-500 to-fuchsia-500",
    slug: "maths",
  },
  {
    name: "Physics",
    desc: "Concepts • Important Derivations • Problems • Notes",
    color: "from-blue-500 to-cyan-400",
    slug: "physics",
  },
  {
    name: "Chemistry",
    desc: "Organic • Inorganic • Physical • Short Notes • MCQs",
    color: "from-green-400 to-emerald-400",
    slug: "chemistry",
  },
];

export default function MPCDashboard() {
  return (
    <div className="min-h-screen bg-[#0f0e17] pt-24 px-6 text-white">

      {/* TITLE */}
      <h1 className="text-4xl font-extrabold text-center mb-10 bg-gradient-to-r from-purple-300 to-fuchsia-300 text-transparent bg-clip-text">
        MPC – Subjects
      </h1>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">

        {subjects.map((s, i) => (
          <motion.div
            key={s.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ scale: 1.05 }}
            className="p-[2px] rounded-2xl shadow-xl bg-gradient-to-r"
            style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }}
          >
            <Link
              href={`/mpc/${s.slug}`}
              className="block p-8 bg-[#151421] rounded-2xl"
            >
              <h2 className={`text-3xl font-bold bg-gradient-to-r ${s.color} text-transparent bg-clip-text`}>
                {s.name}
              </h2>

              <p className="mt-3 text-gray-400 text-sm">{s.desc}</p>
            </Link>
          </motion.div>
        ))}

      </div>
    </div>
  );
}
