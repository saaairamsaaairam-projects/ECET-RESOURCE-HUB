"use client";

import { useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { useRouter } from "next/navigation";

export default function AdminUnlock() {
  const { enableAdmin } = useAdmin();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!password.trim()) {
      setError("Please enter a password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Verify password via API (safer than client-side check)
      const response = await fetch("/api/auth/verify-admin-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        enableAdmin();
        router.push("/admin");
      } else {
        setError(data.error || "Invalid password");
      }
    } catch (err) {
      setError("Error verifying password");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === "Enter") submit();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0e17]">
      <div className="bg-[#1a1926] p-8 rounded-xl shadow-2xl w-96 border border-purple-500/20">
        <h1 className="text-2xl font-bold mb-2 text-center bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
          Admin Access
        </h1>
        <p className="text-gray-400 text-sm text-center mb-6">
          Enter the admin password to unlock admin features
        </p>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <input
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          className="w-full bg-[#0f0e17] border border-purple-500/30 text-white p-3 rounded mb-4 placeholder-gray-500 focus:outline-none focus:border-purple-500 disabled:opacity-50"
        />

        <button
          onClick={submit}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white py-3 rounded font-semibold hover:from-purple-700 hover:to-fuchsia-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Verifying..." : "Unlock Admin Mode"}
        </button>

        <p className="text-gray-500 text-xs text-center mt-4">
          ⚠️ This view logs authentication attempts for security
        </p>
      </div>
    </div>
  );
}
