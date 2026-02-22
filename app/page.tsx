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
      <div className="fixed inset-0 -z-10">
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
          className="absolute top-20 left-1/3 w-[500px] h-[500px] bg-purple-600 opacity-15 rounded-full blur-[120px]"
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
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-violet-600 opacity-10 rounded-full blur-[120px]"
        ></motion.div>

        {/* Additional Floating Gradient Blobs */}
        <motion.div
          animate={{ y: [0, -40, 0], x: [0, 20, 0] }}
          transition={{ repeat: Infinity, duration: 12 }}
          className="absolute top-1/2 left-5 w-[300px] h-[300px] bg-fuchsia-600/20 rounded-full blur-[100px]"
        ></motion.div>

        <motion.div
          animate={{ y: [0, 30, 0], x: [0, -30, 0] }}
          transition={{ repeat: Infinity, duration: 14 }}
          className="absolute bottom-1/3 right-1/3 w-[250px] h-[250px] bg-pink-500/15 rounded-full blur-[90px]"
        ></motion.div>
      </div>

      {/* ---------------------- HERO SECTION ---------------------- */}
      <section className="px-6 pt-20 pb-24 text-center relative">
        
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
          className="text-7xl md:text-8xl font-black bg-gradient-to-r from-purple-400 via-violet-400 to-purple-600 text-transparent bg-clip-text leading-tight"
        >
          PolyHub
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto"
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
          <div className="flex items-center bg-white/5 border border-white/20 backdrop-blur-xl px-5 py-4 rounded-2xl w-full max-w-2xl hover:border-purple-400/50 transition" suppressHydrationWarning>
            <Search className="w-5 h-5 text-purple-300" />
            <input
              type="text"
              placeholder="Search notes, subjects, files..."
              className="bg-transparent outline-none ml-4 w-full text-white placeholder-gray-400 text-lg"
              suppressHydrationWarning
            />
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-8 flex gap-4 justify-center flex-wrap"
          suppressHydrationWarning
        >
          <Link href="/login" suppressHydrationWarning>
            <button className="px-8 py-3 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg font-semibold hover:opacity-90 transition" suppressHydrationWarning>
              Get Started
            </button>
          </Link>
          <Link href="/dashboard" suppressHydrationWarning>
            <button className="px-8 py-3 bg-white/10 border border-white/20 rounded-lg font-semibold hover:bg-white/20 transition" suppressHydrationWarning>
              Explore
            </button>
          </Link>
        </motion.div>
      </section>

      {/* ---------------------- CATEGORY TILES ---------------------- */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold mb-12">Explore Categories</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05, translateY: -5 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="group p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl cursor-pointer hover:border-purple-400/50 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <category.icon className="w-8 h-8 text-purple-300 group-hover:text-purple-200 transition" />
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition"></div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                <p className="text-gray-400 text-sm">{category.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ---------------------- SUBJECTS SECTION ---------------------- */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold mb-12">Popular Subjects</h2>

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
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold mb-12">Latest Uploads</h2>

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
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6"
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
              <p className="text-4xl font-bold text-purple-300 mb-2">{stat.value}</p>
              <p className="text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ---------------------- FOOTER ---------------------- */}
      <footer className="px-6 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p className="mb-2">© 2026 PolyHub. Built for ECET Students.</p>
          <p className="text-sm">Empowering polytechnic education through collaboration & sharing</p>
        </div>
      </footer>
    </div>
  );
}