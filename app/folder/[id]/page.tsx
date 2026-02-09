"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
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

import Breadcrumb from "@/components/Breadcrumb";
import ConfirmModal from "@/components/ConfirmModal";
import DragDropUploader from "@/components/DragDropUploader";
export default function FolderPage() {
  const params = useParams();
  const folderId = params?.id as string;
  
  const [folder, setFolder] = useState<any>(null);
  const [subfolders, setSubfolders] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [breadcrumbPath, setBreadcrumbPath] = useState<any[]>([]);
  const { isAdmin } = useAuth();
  const { addToast } = useToast();
  const [renameTarget, setRenameTarget] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [renameValue, setRenameValue] = useState("");

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

  function startRenameFile(file: any) {
    setRenameTarget({ type: "file", item: file });
    setRenameValue(file.file_name);
  }

  function startRenameFolder(folder: any) {
    setRenameTarget({ type: "folder", item: folder });
    setRenameValue(folder.name);
  }

  function startDeleteFile(file: any) {
    setDeleteTarget({ type: "file", item: file });
  }

  function startDeleteFolder(folder: any) {
    setDeleteTarget({ type: "folder", item: folder });
  }

  async function confirmRename() {
    if (!renameTarget) return;

    try {
      if (renameTarget.type === "file") {
        await supabase
          .from("files")
          .update({ file_name: renameValue })
          .eq("id", renameTarget.item.id);
        loadFiles();
        addToast(`File renamed to "${renameValue}"`, "success");
      } else {
        await supabase
          .from("folders")
          .update({ name: renameValue })
          .eq("id", renameTarget.item.id);
        loadSubfolders();
        addToast(`Folder renamed to "${renameValue}"`, "success");
      }

      setRenameTarget(null);
    } catch (error) {
      addToast("Failed to rename item", "error");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.type === "file") {
        await supabase
          .from("files")
          .delete()
          .eq("id", deleteTarget.item.id);
        loadFiles();
        addToast("File deleted successfully", "success");
      } else {
        // SAFETY CHECK: prevent deleting root folders
        if (!deleteTarget.item.parent_id) {
          addToast("You cannot delete a root folder!", "warning");
          setDeleteTarget(null);
          return;
        }

        await supabase
          .from("folders")
          .delete()
          .eq("id", deleteTarget.item.id);

        loadSubfolders();
        addToast("Folder deleted successfully", "success");
      }

      setDeleteTarget(null);
    } catch (error) {
      addToast("Failed to delete item", "error");
    }
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
      <Breadcrumb
        items={breadcrumbPath.map((item) => ({
          label: item.name,
          href: `/folder/${item.id}`,
        }))}
      />
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
          className="relative z-10 flex gap-4 mb-12 flex-wrap"
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

      {/* DRAG DROP UPLOADER */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative z-10 mb-12"
        >
          <DragDropUploader folderId={folderId} onUploadComplete={loadFiles} />
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
                className="group relative"
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

                {isAdmin && (
                  <div className="absolute top-3 right-3 flex gap-2 z-20">
                    <button
                      onClick={() => startRenameFolder(subfolder)}
                      className="text-blue-300 hover:text-blue-200 text-sm bg-white/5 px-2 py-1 rounded"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => startDeleteFolder(subfolder)}
                      className="text-red-400 hover:text-red-300 text-sm bg-white/5 px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                )}
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
                className="group relative"
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

                {isAdmin && (
                  <div className="absolute top-3 right-3 flex gap-2 z-20">
                    <button
                      onClick={() => startRenameFile(file)}
                      className="text-blue-300 hover:text-blue-200 text-sm bg-white/5 px-2 py-1 rounded"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => startDeleteFile(file)}
                      className="text-red-400 hover:text-red-300 text-sm bg-white/5 px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                )}
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
      <ConfirmModal
        open={!!renameTarget}
        text={
          <div>
            <p className="mb-3">Enter new name:</p>
            <input
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg outline-none"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
            />
          </div>
        }
        onConfirm={confirmRename}
        onCancel={() => setRenameTarget(null)}
      />

      <ConfirmModal
        open={!!deleteTarget}
        text={`Are you sure you want to delete "${deleteTarget?.item?.name || deleteTarget?.item?.file_name}"?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
