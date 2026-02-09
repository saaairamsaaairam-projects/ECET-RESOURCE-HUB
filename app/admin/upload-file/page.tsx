"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase";
import { Suspense } from "react";

function UploadFileContent() {
  const { isAdmin } = useAuth();
  const params = useSearchParams();
  const router = useRouter();
  const folder_id = params.get("folder");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isAdmin) return <p className="p-6">Unauthorized</p>;

  async function upload() {
    if (!file) {
      alert("Please select a file.");
      return;
    }

    if (!folder_id) {
      alert("No folder specified!");
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
      formData.append("file", file);
      formData.append("folder_id", folder_id);

      const response = await fetch("/api/admin/upload-file", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data2 = await response.json();

      if (!response.ok) {
        alert(`Upload failed: ${data2.error}`);
        return;
      }

      console.log("✅ File uploaded successfully");
      router.push(`/folder/${folder_id}`);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to upload file");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">

      <h1 className="text-2xl font-bold mb-4">Upload File</h1>

      <input
        type="file"
        className="mb-3"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        disabled={loading}
      />

      <button
        onClick={upload}
        className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}

export default function UploadFile() {
  return (
    <Suspense fallback={<p className="p-6">Loading...</p>}>
      <UploadFileContent />
    </Suspense>
  );
}
