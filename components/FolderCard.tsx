"use client";

import Link from "next/link";
import { useState } from "react";
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
    <div className="relative group">

      <Link
        href={`/folder/${folder.id}`}
        className="block bg-white shadow-md rounded-xl overflow-hidden hover:shadow-xl transition hover:-translate-y-1"
      >
        <div className="relative h-32 w-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
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

        <div className="p-4 text-center">
          <h2 className="text-lg font-semibold break-words">{folder.name}</h2>
        </div>
      </Link>

      {/* Admin delete button */}
      {isAdmin && (
        <button
          onClick={deleteFolder}
          className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded opacity-80 hover:opacity-100"
        >
          ✕
        </button>
      )}
    </div>
  );
}
