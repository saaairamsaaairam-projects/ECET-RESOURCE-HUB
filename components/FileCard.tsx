"use client";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase";
import { getFileTypeInfo } from "@/utils/getFileIcon";
import PdfThumbnail from "@/components/PdfThumbnail";
import { Download, Eye, FileText, PencilLine, Trash2, Video } from "lucide-react";
import { useState } from "react";

interface FileType {
  id: string;
  file_name: string;
  file_url: string;
  folder_id: string;
}

export default function FileCard({ file }: { file: FileType }) {
  const { isAdmin } = useAuth();
  const [showPreview, setShowPreview] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const { type, icon } = getFileTypeInfo(file.file_name);
  const isImage = type === "image";
  const isPDF = type === "pdf";
  const isVideo = type === "video";

  async function deleteFile() {
    if (!confirm("Delete this file?")) return;

    const url = file.file_url;
    const path = url.split("/").pop() || "";

    await supabase.storage.from("folder_files").remove([path]);

    await supabase.from("files").delete().eq("id", file.id);

    window.location.reload();
  }

  async function downloadFile() {
    setIsDownloading(true);
    try {
      const response = await fetch(file.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download file");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <>
      <div className="relative rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/20 backdrop-blur-xl transition hover:-translate-y-1 hover:border-purple-400/50">

        {/* File thumbnail / icon */}
        <div className="flex justify-center mb-3 w-full">
          {isPDF ? (
            <PdfThumbnail url={file.file_url} />
          ) : isImage ? (
            <img src={file.file_url} alt="preview" className="w-full h-32 object-cover rounded-lg mb-3" />
          ) : (
            <div className="flex flex-col items-center">
              <img src={icon} alt="icon" width={56} height={56} className="opacity-90 mb-3" />
              {isVideo && <div className="-mt-14">
                <div className="bg-black bg-opacity-40 rounded-full p-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5v14l11-7L8 5z" fill="#fff" />
                  </svg>
                </div>
              </div>}
            </div>
          )}
        </div>

        {/* File name */}
        <p className="mb-3 break-words text-center text-sm font-semibold text-white sm:text-base">
          {file.file_name}
        </p>

        {/* Action buttons */}
        <div className="mb-2 flex flex-wrap items-center justify-center gap-2">
          {isImage && (
            <button
              onClick={() => setShowPreview(true)}
              className="inline-flex items-center gap-1 rounded-lg bg-blue-500/90 px-2.5 py-1.5 text-[11px] font-medium text-white transition hover:bg-blue-400 sm:text-xs"
            >
              <Eye className="h-3.5 w-3.5" /> Preview
            </button>
          )}

          <a
            href={file.file_url}
            target="_blank"
            download
            onClick={downloadFile}
            className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/90 px-2.5 py-1.5 text-[11px] font-medium text-white transition hover:bg-emerald-400 disabled:opacity-50 sm:text-xs"
          >
            {isDownloading ? <Download className="h-3.5 w-3.5 animate-bounce" /> : <Download className="h-3.5 w-3.5" />}
            Download
          </a>

          {isPDF && (
            <a
              href={file.file_url}
              target="_blank"
              className="inline-flex items-center gap-1 rounded-lg bg-purple-600/90 px-2.5 py-1.5 text-[11px] font-medium text-white transition hover:bg-purple-500 sm:text-xs"
            >
              <FileText className="h-3.5 w-3.5" /> Open
            </a>
          )}
        </div>

        {/* Admin rename/delete */}
        {isAdmin && (
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <a
              href={`/admin/rename-file?id=${file.id}`}
              className="inline-flex items-center gap-1 rounded-lg bg-amber-500/90 px-2.5 py-1.5 text-[11px] font-medium text-white transition hover:bg-amber-400 sm:text-xs"
            >
              <PencilLine className="h-3.5 w-3.5" /> Rename
            </a>

            <button
              onClick={deleteFile}
              className="inline-flex items-center gap-1 rounded-lg bg-red-600/90 px-2.5 py-1.5 text-[11px] font-medium text-white transition hover:bg-red-500 sm:text-xs"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {showPreview && isImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl max-h-screen overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gray-100 p-3 flex justify-between items-center border-b">
              <p className="font-semibold">{file.file_name}</p>
              <button
                onClick={() => setShowPreview(false)}
                className="text-2xl font-bold text-gray-600 hover:text-black"
              >
                ✕
              </button>
            </div>
            <div className="p-4 flex justify-center">
              <img
                src={file.file_url}
                alt={file.file_name}
                className="max-w-full max-h-screen object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
