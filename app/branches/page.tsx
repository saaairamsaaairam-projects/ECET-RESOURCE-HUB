"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const branches = [
  { name: "CSE", desc: "Computer Science Engineering", color: "from-purple-600 to-fuchsia-600" },
  { name: "ECE", desc: "Electronics & Communication", color: "from-pink-500 to-purple-600" },
  { name: "EEE", desc: "Electrical & Electronics", color: "from-yellow-400 to-orange-500" },
  { name: "MECH", desc: "Mechanical Engineering", color: "from-blue-500 to-cyan-400" },
  { name: "CIVIL", desc: "Civil Engineering", color: "from-green-500 to-emerald-400" },
  { name: "CHEM", desc: "Chemical Engineering", color: "from-red-500 to-rose-500" },
];

export default function BranchDashboard() {
  return (
    <div className="min-h-screen bg-[#0f0e17] pt-24 px-6 text-white">

      {/* TITLE */}
      <h1 className="text-4xl font-extrabold text-center bg-gradient-to-r from-purple-300 to-fuchsia-400 text-transparent bg-clip-text mb-10">
        Choose Your Branch
      </h1>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">

        {branches.map((b, i) => (
          <motion.div
            key={b.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            whileHover={{ scale: 1.05 }}
            className="p-[2px] rounded-2xl bg-gradient-to-r shadow-xl cursor-pointer"
            style={{
              backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
            }}
          >
            <Link
              href={`/branches/${b.name.toLowerCase()}`}
              className="block p-8 bg-[#151421] rounded-2xl"
            >
              <h2 className={`text-3xl font-bold bg-gradient-to-r ${b.color} text-transparent bg-clip-text`}>
                {b.name}
              </h2>
              <p className="mt-3 text-gray-400">{b.desc}</p>
            </Link>
          </motion.div>
        ))}

      </div>

    </div>
  );
}
