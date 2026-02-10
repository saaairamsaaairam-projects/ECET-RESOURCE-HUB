"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/context/AuthContext";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

function RenameFolderContent() {
  const { isAdmin } = useAuth();
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get("id");
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);

  if (!isAdmin) return <p className="p-6">Unauthorized</p>;

  useEffect(() => {
    loadFolder();
  }, []);

  async function loadFolder() {
    const { data } = await supabase
      .from("folders")
      .select("*")
      .eq("id", id)
      .single();

    if (data) setNewName(data.name);
    setLoading(false);
  }

  async function rename() {
    await supabase
      .from("folders")
      .update({ name: newName })
      .eq("id", id);

    router.back(); // go to previous folder page
  }

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Rename Folder</h1>

      <input
        type="text"
        className="w-full border p-2 rounded mb-4"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
      />

      <button
        onClick={rename}
        className="px-4 py-2 bg-yellow-600 text-white rounded"
      >
        Save
      </button>
    </div>
  );
}

export default function RenameFolder() {
  return (
    <Suspense fallback={<p className="p-6">Loading...</p>}>
      <RenameFolderContent />
    </Suspense>
  );
}
