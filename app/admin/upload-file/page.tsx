"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { supabase } from "@/utils/supabase";
import { Suspense } from "react";

function UploadFileContent() {
  const { isAdmin } = useAuth();
  const { addToast } = useToast();
  const params = useSearchParams();
  const router = useRouter();
  const folder_id = params.get("folder");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isAdmin) return <p className="p-6">Unauthorized</p>;

  async function upload() {
    if (!file) {
      addToast("Please select a file", "warning");
      return;
    }

    if (!folder_id) {
      addToast("No folder specified!", "error");
      return;
    }

    setLoading(true);

    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;

      if (!token) {
        addToast("Authentication required", "error");
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
        addToast(`Upload failed: ${data2.error}`, "error");
        return;
      }

      addToast("File uploaded successfully!", "success");
      router.push(`/folder/${folder_id}`);
    } catch (error) {
      console.error("Error:", error);
      addToast("Failed to upload file", "error");
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
