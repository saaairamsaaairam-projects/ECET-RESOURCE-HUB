"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FolderPlus,
  FileUp,
  FolderOpen,
  File,
  Eye,
  Download,
  ChevronRight,
  Home,
} from "lucide-react";
import { useParams } from "next/navigation";

export default function FolderPage() {
  const params = useParams();
  const folderId = params?.id as string;
  
  const [folder, setFolder] = useState<any>(null);
  const [subfolders, setSubfolders] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [breadcrumbPath, setBreadcrumbPath] = useState<any[]>([]);
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (!folderId) return;
    loadFolder();
    loadSubfolders();
    loadFiles();
    loadBreadcrumb();
  }, [folderId]);

  async function loadFolder() {
    const { data } = await supabase
      .from("folders")
      .select("*")
      .eq("id", folderId)
      .single();

    setFolder(data);
  }

  async function loadSubfolders() {
    const { data } = await supabase
      .from("folders")
      .select("*")
      .eq("parent_id", folderId);

    setSubfolders(data || []);
  }

  async function loadFiles() {
    const { data } = await supabase
      .from("files")
      .select("*")
      .eq("folder_id", folderId)
      .order("created_at", { ascending: false });

    setFiles(data || []);
    setLoading(false);
  }

  async function loadBreadcrumb() {
    const path = [];
    let currentId = folderId;

    while (currentId) {
      const { data } = await supabase
        .from("folders")
        .select("*")
        .eq("id", currentId)
        .single();

      if (data) {
        path.unshift(data);
        currentId = data.parent_id;
      } else {
        break;
      }
    }

    setBreadcrumbPath(path);
  }

  if (!folder) {
    return (
      <div className="min-h-screen bg-[#0f0e17] flex items-center justify-center text-white pt-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

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

      {/* BREADCRUMB */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mb-8 flex items-center gap-2 text-gray-400 text-sm"
      >
        <Link href="/dashboard" className="hover:text-purple-300 transition flex items-center gap-1">
          <Home size={16} /> Dashboard
        </Link>

        {breadcrumbPath.map((item, idx) => (
          <div key={item.id} className="flex items-center gap-2">
            <ChevronRight size={16} />
            {idx === breadcrumbPath.length - 1 ? (
              <span className="text-purple-300 font-semibold">{item.name}</span>
            ) : (
              <Link href={`/folder/${item.id}`} className="hover:text-purple-300 transition">
                {item.name}
              </Link>
            )}
          </div>
        ))}
      </motion.div>

      {/* PAGE TITLE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-violet-400 to-purple-600 text-transparent bg-clip-text">
          {folder.name}
        </h1>
        <p className="text-gray-300">
          Explore subfolders and files inside this folder
        </p>
      </motion.div>

      {/* ADMIN ACTIONS */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 flex gap-4 mb-8 flex-wrap"
        >
          <Link
            href={`/admin/create-folder?parent=${folderId}`}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg shadow-lg hover:opacity-90 transition flex items-center gap-2 font-semibold"
          >
            <FolderPlus size={20} /> Add Subfolder
          </Link>

          <Link
            href={`/admin/upload-file?folder=${folderId}`}
            className="px-6 py-3 bg-gradient-to-r from-fuchsia-600 to-fuchsia-700 rounded-lg shadow-lg hover:opacity-90 transition flex items-center gap-2 font-semibold"
          >
            <FileUp size={20} /> Upload File
          </Link>
        </motion.div>
      )}

      {/* SUBFOLDERS SECTION */}
      {subfolders.length > 0 && (
        <div className="relative z-10 mb-12">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-300 to-purple-500 text-transparent bg-clip-text">
            Subfolders
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {subfolders.map((subfolder, i) => (
              <motion.div
                key={subfolder.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.03, translateY: -5 }}
                className="group"
              >
                <Link href={`/folder/${subfolder.id}`}>
                  <div className="p-6 bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl hover:border-purple-400/50 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer transition-all duration-300 h-full flex flex-col items-start">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-purple-500/40 transition mb-4">
                      <FolderOpen className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold group-hover:text-purple-300 transition">
                      {subfolder.name}
                    </h3>
                    <p className="text-gray-400 text-sm mt-2">Subfolder</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* FILES SECTION */}
      <div className="relative z-10">
        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-fuchsia-300 to-fuchsia-500 text-transparent bg-clip-text">
          Files
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-8 h-8 border-2 border-fuchsia-400 border-t-transparent rounded-full"
            />
          </div>
        ) : files.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {files.map((file, i) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.03, translateY: -5 }}
                className="group"
              >
                <div className="p-6 bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl hover:border-fuchsia-400/50 hover:shadow-2xl hover:shadow-fuchsia-500/20 cursor-pointer transition-all duration-300 h-full flex flex-col">
                  <div className="w-12 h-12 bg-gradient-to-br from-fuchsia-500 to-pink-600 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-fuchsia-500/40 transition mb-4">
                    <File className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-lg font-semibold break-words mb-4 flex-grow group-hover:text-fuchsia-300 transition">
                    {file.file_name}
                  </h3>

                  <div className="flex gap-3 flex-wrap">
                    <a
                      href={file.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600/40 hover:bg-purple-600/60 rounded-lg transition text-sm font-semibold"
                    >
                      <Eye size={16} /> Preview
                    </a>

                    <a
                      href={file.file_url}
                      download
                      className="flex items-center gap-2 px-4 py-2 bg-fuchsia-600/40 hover:bg-fuchsia-600/60 rounded-lg transition text-sm font-semibold"
                    >
                      <Download size={16} /> Download
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              No files uploaded yet.{" "}
              {isAdmin && "Upload your first file to get started!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
