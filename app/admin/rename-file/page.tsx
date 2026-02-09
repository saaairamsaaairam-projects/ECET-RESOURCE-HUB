"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

interface FileData {
  id: string;
  file_name: string;
  file_url: string;
  folder_id: string;
}

function RenameFileContent() {
  const { isAdmin } = useAuth();
  const params = useSearchParams();
  const id = params.get("id");
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const [file, setFile] = useState<FileData | null>(null);
  const [loading, setLoading] = useState(true);

  if (!isAdmin) return <p className="p-6">Unauthorized</p>;

  useEffect(() => {
    loadFile();
  }, []);

  async function loadFile() {
    const { data } = await supabase
      .from("files")
      .select("*")
      .eq("id", id)
      .single();

    if (data) {
      setFile(data);
      setNewName(data.file_name);
    }

    setLoading(false);
  }

  async function rename() {
    await supabase
      .from("files")
      .update({ file_name: newName })
      .eq("id", id);

    router.back();
  }

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Rename File</h1>

      <input
        type="text"
        value={newName}
        className="w-full border p-2 rounded mb-4"
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

export default function RenameFile() {
  return (
    <Suspense fallback={<p className="p-6">Loading...</p>}>
      <RenameFileContent />
    </Suspense>
  );
}
