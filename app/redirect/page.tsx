"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { AlertCircle, Loader } from "lucide-react";

function RedirectContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchAndRedirect = async () => {
      const key = searchParams.get("key");

      if (!key) {
        setStatus("error");
        setErrorMessage("No folder key provided");
        return;
      }

      try {
        const response = await fetch(`/api/folder-map?key=${encodeURIComponent(key)}`);

        if (!response.ok) {
          setStatus("error");
          setErrorMessage("Folder not found. It may have been deleted or renamed.");
          return;
        }

        const data = await response.json();
        const folderId = data.folderId;

        // Redirect to the actual folder
        router.replace(`/folder/${folderId}`);
      } catch (error) {
        console.error("Redirect error:", error);
        setStatus("error");
        setErrorMessage("Failed to locate folder. Please try again.");
      }
    };

    fetchAndRedirect();
  }, [searchParams, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-slate-300 text-lg">Finding your folder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="bg-slate-800 rounded-xl p-8 max-w-md w-full border border-slate-700">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-slate-100 mb-2">Folder Not Found</h1>
        <p className="text-slate-400 mb-6">{errorMessage}</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 rounded-lg transition"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-center">
        <Loader className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
        <p className="text-slate-300 text-lg">Loading...</p>
      </div>
    </div>
  );
}

export default function RedirectPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RedirectContent />
    </Suspense>
  );
}
