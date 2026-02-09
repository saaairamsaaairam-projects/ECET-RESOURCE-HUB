"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase";
import { Suspense } from "react";

function CreateFolderContent() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const parent_id = params.get("parent") || null;

  if (!isAdmin) return <p className="p-6">Unauthorized</p>;

  const [name, setName] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function createFolder() {
    if (!name.trim()) {
      alert("Please enter a folder name");
      return;
    }

    setLoading(true);

    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;

      if (!token) {
        alert("Authentication required");
        return;
      }

      const formData = new FormData();
      formData.append("name", name);
      formData.append("parent_id", parent_id || "");
      if (thumbnail) {
        formData.append("file", thumbnail);
      }

      const response = await fetch("/api/admin/create-folder", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data2 = await response.json();

      if (!response.ok) {
        alert(`Error: ${data2.error}`);
        return;
      }

      console.log("✅ Folder created successfully");
      router.push(parent_id ? `/folder/${parent_id}` : "/");
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to create folder");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">

      <h1 className="text-2xl font-bold mb-4">Create Folder</h1>

      <input
        type="text"
        placeholder="Folder Name"
        className="w-full border p-2 rounded mb-3"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={loading}
      />

      <input
        type="file"
        accept="image/*"
        className="mb-3"
        onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
        disabled={loading}
      />

      <button
        onClick={createFolder}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Creating..." : "Create"}
      </button>
    </div>
  );
}

export default function CreateFolder() {
  return (
    <Suspense fallback={<p className="p-6">Loading...</p>}>
      <CreateFolderContent />
    </Suspense>
  );
}
