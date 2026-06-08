"use client";

import Link from "next/link";
import { useState } from "react";
import { FolderOpen, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase";

interface Folder {
  id: string;
  name: string;
  thumbnail?: string;
}

export default function FolderCard({ folder }: { folder: Folder }) {
  const { isAdmin } = useAuth();
  const [imageLoaded, setImageLoaded] = useState(false);

  async function deleteFolder() {
    if (!confirm("Are you sure you want to delete this folder?")) return;

    await supabase.from("folders").delete().eq("id", folder.id);

    window.location.reload();
  }

  return (
    <div className="group relative">
      <Link
        href={`/folder/${folder.id}`}
        className="block overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/20 backdrop-blur-xl transition hover:-translate-y-1 hover:border-purple-400/50 hover:bg-white/10"
      >
        <div className="flex items-center gap-3 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-violet-500/10 p-4 sm:block sm:p-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-purple-100 sm:mx-auto sm:mt-4 sm:h-14 sm:w-14">
            <FolderOpen className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          {folder.thumbnail && (
            <img
              src={folder.thumbnail}
              alt={folder.name}
              className={`w-full h-full object-cover group-hover:scale-105 transition ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(false)}
            />
          )}
          {!imageLoaded && (
            <div className="text-blue-300 text-5xl">📁</div>
          )}
        </div>

        <div className="p-4 text-left sm:text-center">
          <h2 className="text-sm font-semibold text-white sm:text-base">{folder.name}</h2>
          <p className="mt-1 text-xs text-gray-300 sm:text-sm">Open resources and topics</p>
        </div>
      </Link>

      {/* Admin delete button */}
      {isAdmin && (
        <button
          onClick={deleteFolder}
          className="absolute right-2 top-2 rounded-full bg-red-600/90 p-1.5 text-white shadow-lg shadow-black/30 transition hover:bg-red-500"
          aria-label="Delete folder"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
