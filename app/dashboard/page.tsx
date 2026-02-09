"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FolderOpen, Plus } from "lucide-react";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/context/AuthContext";

interface Folder {
  id: string;
  name: string;
  thumbnail?: string;
  parent_id?: string | null;
}

export default function DashboardPage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    // Public users can now load folders (no login required)
    const loadFolders = async () => {
      try {
        const { data, error } = await supabase
          .from("folders")
          .select("*")
          .is("parent_id", null); // ONLY root folders

        if (!error && data) {
          setFolders(data);
        }
      } catch (err) {
        console.error("Error loading folders:", err);
      } finally {
        setLoading(false);
      }
    };

    loadFolders();
  }, []);

  return (
    <div className="min-h-screen bg-[#0f0e17] pt-24 px-6 text-white relative overflow-hidden">
      {/* FLOATING BLOBS */}
      <motion.div
        animate={{ y: [0, -40, 0], x: [0, 20, 0] }}
        transition={{ repeat: Infinity, duration: 12 }}
        className="absolute top-1/2 left-5 w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[100px]"
      />
      <motion.div
        animate={{ y: [0, 30, 0], x: [0, -30, 0] }}
        transition={{ repeat: Infinity, duration: 14 }}
        className="absolute bottom-1/3 right-1/3 w-[250px] h-[250px] bg-fuchsia-600/15 rounded-full blur-[90px]"
      />

      {/* HEADER SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-violet-400 to-purple-600 text-transparent bg-clip-text">
          ECET Resources
        </h1>
        <p className="text-gray-300 text-lg">
          Browse and download study materials. Admin tools available after login.
        </p>
      </motion.div>

      {/* ADMIN CREATE FOLDER BUTTON */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative z-10 mb-8"
        >
          <Link
            href="/admin/create-folder"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-lg hover:opacity-90 transition shadow-lg shadow-purple-500/30 font-semibold"
          >
            <Plus size={20} />
            Create New Folder
          </Link>
        </motion.div>
      )}

      {/* FOLDER GRID */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full"
            />
          </div>
        ) : folders.length > 0 ? (
          folders.map((folder, i) => (
            <motion.div
              key={folder.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.5 }}
              whileHover={{ scale: 1.03, translateY: -5 }}
              className="group"
            >
              <Link href={`/folder/${folder.id}`}>
                <div
                  className="p-6 bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl 
                  hover:border-purple-400/50 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer 
                  transition-all duration-300 h-full flex flex-col items-start"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-purple-500/40 transition mb-4">
                    <FolderOpen className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold group-hover:text-purple-300 transition">
                    {folder.name}
                  </h2>
                  <p className="text-gray-400 text-sm mt-2">Study Materials</p>
                </div>
              </Link>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-400 text-lg">
              No folders available yet.{" "}
              {isAdmin && "Create your first folder to get started!"}
            </p>
          </div>
        )}
      </div>

      {/* FOOTER STATS */}
      {folders.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative z-10 text-center text-gray-400 pb-8"
        >
          <p>
            Showing <span className="text-purple-300 font-semibold">{folders.length}</span> folder
            {folders.length !== 1 ? "s" : ""}
          </p>
        </motion.div>
      )}
    </div>
  );
}
