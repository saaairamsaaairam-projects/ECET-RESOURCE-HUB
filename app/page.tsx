"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import FolderCard from "@/components/FolderCard";
import { useAuth } from "@/context/AuthContext";

interface Folder {
  id: string;
  name: string;
  thumbnail?: string;
  parent_id?: string | null;
}

export default function Dashboard() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const { isAdmin, user } = useAuth();

  async function logout() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  useEffect(() => {
    loadFolders();
  }, []);

  async function loadFolders() {
    const { data } = await supabase
      .from("folders")
      .select("*")
      .is("parent_id", null);

    setFolders(data || []);
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <div className="flex gap-3">
          {user && (
            <span className="text-gray-700 text-sm">
              👤 {user.email}
            </span>
          )}

          {!isAdmin && !user && (
            <a
              href="/login"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Login
            </a>
          )}

          {isAdmin && (
            <a
              href="/admin/create-folder"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              + Add Folder
            </a>
          )}

          {user && (
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Folder grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {folders.map(folder => (
          <FolderCard key={folder.id} folder={folder} />
        ))}
      </div>

    </main>
  );
}