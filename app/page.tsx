"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/utils/supabase";
import { motion } from "framer-motion";
import { Search, BookOpen, FolderOpen, Sparkles, Download } from "lucide-react";
import SpotlightSearch from "@/components/SpotlightSearch";

interface FileType {
  id: string;
  file_name: string;
  created_at: string;
  folder_id: string;
}

export default function HomePage() {
  const [latestFiles, setLatestFiles] = useState<FileType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFiles = async () => {
      try {
        const { data, error } = await supabase
          .from("files")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(6);

        if (!error && data) {
          setLatestFiles(data);
        }
      } catch (err) {
        console.error("Error loading files:", err);
      } finally {
        setLoading(false);
      }
    };

    loadFiles();
  }, []);

  const categories = [
    { name: "📚 MPC", icon: BookOpen, description: "Math, Physics, Chemistry" },
    { name: "🎯 Branch", icon: FolderOpen, description: "Your stream folder" },
    { name: "📄 Papers", icon: BookOpen, description: "Previous exams" },
    { name: "⚡ Bits", icon: Sparkles, description: "Important MCQs" },
    { name: "📐 Formulas", icon: BookOpen, description: "Quick reference" },
    { name: "🛠️ Tools", icon: Sparkles, description: "Study tools" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0e17] via-[#1a1823] to-[#0f0e17] text-white overflow-hidden">
      <SpotlightSearch />
      
      {/* Animated Background Blobs - Enhanced */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-1/4 h-[240px] w-[240px] rounded-full bg-purple-600/20 blur-[90px] sm:left-1/3 sm:h-[380px] sm:w-[380px] sm:blur-[110px] lg:h-[500px] lg:w-[500px]"
        ></motion.div>
        <motion.div
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-0 right-1/4 h-[280px] w-[280px] rounded-full bg-violet-600/15 blur-[90px] sm:h-[420px] sm:w-[420px] sm:blur-[110px] lg:h-[600px] lg:w-[600px]"
        ></motion.div>

        {/* Additional Floating Gradient Blobs */}
        <motion.div
          animate={{ y: [0, -40, 0], x: [0, 20, 0] }}
          transition={{ repeat: Infinity, duration: 12 }}
          className="absolute top-1/2 left-2 h-[160px] w-[160px] rounded-full bg-fuchsia-600/20 blur-[70px] sm:left-5 sm:h-[220px] sm:w-[220px] sm:blur-[90px] lg:h-[300px] lg:w-[300px]"
        ></motion.div>

        <motion.div
          animate={{ y: [0, 30, 0], x: [0, -30, 0] }}
          transition={{ repeat: Infinity, duration: 14 }}
          className="absolute bottom-1/3 right-1/4 h-[130px] w-[130px] rounded-full bg-pink-500/15 blur-[60px] sm:right-1/3 sm:h-[180px] sm:w-[180px] sm:blur-[80px] lg:h-[250px] lg:w-[250px]"
        ></motion.div>
      </div>

      {/* ---------------------- HERO SECTION ---------------------- */}
      <section className="relative px-4 pb-16 pt-16 text-center sm:px-6 sm:pb-24 sm:pt-20">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6"
        >
          <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm border border-purple-400/30 rounded-full text-sm text-purple-300">
            ✨ Welcome to your learning hub
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="text-5xl font-black leading-tight text-transparent bg-gradient-to-r from-purple-400 via-violet-400 to-purple-600 bg-clip-text sm:text-6xl md:text-7xl lg:text-8xl"
        >
          PolyHub
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mx-auto mt-6 max-w-2xl text-base text-gray-300 sm:text-xl"
        >
          The Ultimate ECET Resource Hub for Polytechnic Students
        </motion.p>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-12 flex justify-center"
        >
          <div className="flex w-full max-w-2xl items-center rounded-2xl border border-white/20 bg-white/5 px-4 py-3 backdrop-blur-xl transition hover:border-purple-400/50 sm:px-5 sm:py-4" suppressHydrationWarning>
            <Search className="w-5 h-5 text-purple-300" />
            <input
              type="text"
              placeholder="Search notes, subjects, files..."
              className="ml-3 w-full bg-transparent text-base text-white outline-none placeholder:text-gray-400 sm:ml-4 sm:text-lg"
              suppressHydrationWarning
            />
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-8 flex flex-wrap justify-center gap-3 sm:gap-4"
          suppressHydrationWarning
        >
          <Link href="/login" suppressHydrationWarning>
            <button className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-violet-600 px-6 py-3 font-semibold transition hover:opacity-90 sm:w-auto sm:px-8" suppressHydrationWarning>
              Get Started
            </button>
          </Link>
          <Link href="/dashboard" suppressHydrationWarning>
            <button className="w-full rounded-lg border border-white/20 bg-white/10 px-6 py-3 font-semibold transition hover:bg-white/20 sm:w-auto sm:px-8" suppressHydrationWarning>
              Explore
            </button>
          </Link>
        </motion.div>
      </section>

      {/* ---------------------- CATEGORY TILES ---------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="mb-8 text-3xl font-bold sm:text-4xl">Explore Categories</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05, translateY: -5 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="group rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-all hover:border-purple-400/50 sm:p-6"
              >
                <div className="flex items-center gap-3 sm:block sm:space-y-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-purple-200 sm:h-12 sm:w-12 sm:bg-purple-500/20">
                    <category.icon className="h-4 w-4 text-purple-200 transition group-hover:text-purple-100 sm:h-6 sm:w-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-white sm:text-xl">{category.name}</h3>
                    <p className="mt-1 text-xs text-gray-400 sm:text-sm">{category.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ---------------------- SUBJECTS SECTION ---------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="mb-8 text-3xl font-bold sm:text-4xl">Popular Subjects</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {["Engineering Mathematics", "Physics", "Chemistry", "Programming", "Electronics", "Data Structures"].map((subject, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.03, translateY: -8 }}
                transition={{ delay: 0.1 * i }}
                viewport={{ once: true }}
                className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl p-6 cursor-pointer hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 group"
              >
                <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-300 transition">{subject}</h3>
                <p className="text-sm text-gray-300">Explore study materials</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ---------------------- LATEST UPLOADS ---------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="mb-8 text-3xl font-bold sm:text-4xl">Latest Uploads</h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full"
              ></motion.div>
            </div>
          ) : latestFiles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestFiles.map((file, index) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-purple-400/50 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="font-semibold text-lg truncate group-hover:text-purple-300 transition">
                        {file.file_name}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        {new Date(file.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Download className="w-5 h-5 text-gray-400 group-hover:text-purple-300 transition" />
                  </div>
                  <Link
                    href={`/folder/${file.folder_id}`}
                    className="text-purple-300 hover:text-purple-200 text-sm font-medium transition"
                  >
                    View Folder →
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No uploads yet. Start exploring!</p>
            </div>
          )}
        </motion.div>
      </section>

      {/* ---------------------- STATS SECTION ---------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-3"
        >
          {[
            { label: "Students", value: "500+" },
            { label: "Resources", value: "1000+" },
            { label: "Subjects", value: "50+" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-center hover:border-purple-400/50 transition"
            >
              <p className="mb-2 text-3xl font-bold text-purple-300 sm:text-4xl">{stat.value}</p>
              <p className="text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ---------------------- FOOTER ---------------------- */}
      <footer className="border-t border-white/10 px-4 py-12 sm:px-6">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p className="mb-2">© 2026 PolyHub. Built for ECET Students.</p>
          <p className="text-sm">Empowering polytechnic education through collaboration & sharing</p>
        </div>
      </footer>
    </div>
  );
}