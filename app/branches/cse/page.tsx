"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const subjects = [
  { name: "Digital Electronics", key: "cse_digital_electronics" },
  { name: "Software Engineering", key: "cse_software_engineering" },
  { name: "Computer Organization & Microprocessors", key: "cse_computer_organization" },
  { name: "Data Structures through C", key: "cse_data_structures" },
  { name: "Computer Networks & Cyber Security", key: "cse_computer_networks" },
  { name: "Operating Systems", key: "cse_operating_systems" },
  { name: "DBMS", key: "cse_dbms" },
  { name: "Java Programming", key: "cse_java" },
  { name: "Web Technologies", key: "cse_web_tech" },
  { name: "Big Data & Cloud Computing", key: "cse_bigdata" },
  { name: "Android Programming", key: "cse_android" },
  { name: "Internet of Things (IoT)", key: "cse_iot" },
  { name: "Python Programming", key: "cse_python" },
];

export default function CSESubjects() {
  return (
    <div className="min-h-screen bg-[#0f0e17] pt-24 px-6 text-white">

      <h1 className="text-4xl font-extrabold mb-10 bg-gradient-to-r from-purple-300 to-cyan-300 text-transparent bg-clip-text">
        CSE – Subjects
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

        {subjects.map((s, i) => (
          <motion.div
            key={s.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            whileHover={{ scale: 1.05 }}
            className="p-8 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-purple-400 hover:shadow-xl transition"
          >
            <Link href={`/redirect?key=${s.key}`}>
              <h2 className="text-xl font-semibold">{s.name}</h2>
            </Link>
          </motion.div>
        ))}

      </div>

    </div>
  );
}
