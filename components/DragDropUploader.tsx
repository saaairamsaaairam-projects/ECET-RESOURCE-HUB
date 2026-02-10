"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabase";
import { useToast } from "@/context/ToastContext";
import { motion } from "framer-motion";
import { UploadCloud, X } from "lucide-react";

export default function DragDropUploader({ folderId, onUploadComplete }: any) {
  const { addToast } = useToast();
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadingFileName, setUploadingFileName] = useState("");

  async function uploadFile(file: File) {
    setUploading(true);
    setUploadingFileName(file.name);
    setProgress(0);

    try {
      const ext = file.name.split(".").pop();
      const filePath = `${Date.now()}.${ext}`;

      const { data, error } = await supabase.storage
        .from("files_bucket")
        .upload(filePath, file, {
          upsert: false,
        });

      if (error) {
        addToast("Upload failed!", "error");
        setUploading(false);
        setProgress(0);
        return;
      }

      // Simulate progress for visual feedback
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      setProgress(100);

      const { data: urlData } = supabase.storage
        .from("files_bucket")
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase.from("files").insert({
        file_name: file.name,
        file_url: urlData.publicUrl,
        folder_id: folderId,
      });

      if (insertError) {
        addToast("Failed to save file info", "error");
        setUploading(false);
        setProgress(0);
        return;
      }

      addToast(`"${file.name}" uploaded successfully!`, "success");
      setUploading(false);
      setProgress(0);
      setUploadingFileName("");
      onUploadComplete();
    } catch (error) {
      console.error("Upload error:", error);
      addToast("Upload failed!", "error");
      setUploading(false);
      setProgress(0);
    }
  }

  function handleDrop(e: any) {
    e.preventDefault();
    setDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) {
      addToast("No files detected.", "warning");
      return;
    }

    files.forEach((file: any) => {
      if (file.size > 100 * 1024 * 1024) {
        addToast(`"${file.name}" is too large (max 100MB)`, "warning");
      } else {
        uploadFile(file);
      }
    });
  }

  function handleFileSelect(e: any) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    files.forEach((file: any) => {
      if (file.size > 100 * 1024 * 1024) {
        addToast(`"${file.name}" is too large (max 100MB)`, "warning");
      } else {
        uploadFile(file);
      }
    });
  }

  return (
    <div className="relative z-10">
      {/* DRAG AREA */}
      <motion.div
        onDragOver={(e: any) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        whileHover={{ scale: 1.01 }}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300
          ${
            dragging
              ? "border-purple-400 bg-purple-500/20 shadow-2xl shadow-purple-500/30"
              : "border-white/20 bg-white/5 hover:bg-white/10 hover:border-purple-300/50"
          }
        `}
      >
        <motion.div
          animate={{ y: dragging ? -5 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <UploadCloud size={48} className="mx-auto text-purple-300 mb-3" />
          <p className="text-gray-200 text-lg font-semibold">
            Drag & drop files here
          </p>
          <p className="text-gray-400 text-sm mt-1">
            or{" "}
            <label className="text-purple-300 hover:text-purple-200 cursor-pointer font-medium">
              click to browse
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </p>
          <p className="text-gray-500 text-xs mt-3">Max 100MB per file</p>
        </motion.div>
      </motion.div>

      {/* PROGRESS BAR */}
      {uploading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <div className="mb-3 flex justify-between items-center">
            <p className="text-sm text-gray-300 font-medium">
              Uploading: {uploadingFileName}
            </p>
            <p className="text-sm font-bold text-purple-300">{progress}%</p>
          </div>

          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 shadow-lg shadow-purple-500/50"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => {
                setUploading(false);
                setProgress(0);
                setUploadingFileName("");
              }}
              className="px-4 py-2 text-sm bg-red-600/30 hover:bg-red-600/50 text-red-300 rounded-lg transition flex items-center gap-2"
            >
              <X size={16} /> Cancel
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
