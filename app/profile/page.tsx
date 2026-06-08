"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  async function handleChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ newPassword: password }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json?.error || "Unable to update password.");
      } else {
        setMessage(json?.message || "Password changed successfully.");
        setPassword("");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-[#0f0e17] text-white flex items-center justify-center">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0f0e17] px-4 pt-24 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl"
        >
          <p className="text-sm uppercase tracking-[0.25em] text-purple-200">Account</p>
          <h1 className="mt-2 text-3xl font-bold">Profile</h1>
          <p className="mt-2 text-gray-300">Signed in as {user?.email || "your account"}.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl"
        >
          <h2 className="text-xl font-semibold">Change Password</h2>
          <p className="mt-2 text-gray-300 text-sm">Update your password anytime from here.</p>

          <form onSubmit={handleChangePassword} className="mt-6 space-y-4">
            <div className="relative max-w-md">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                required
                minLength={6}
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 outline-none transition focus:border-purple-400"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-200"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && <p className="max-w-md rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}
            {message && <p className="max-w-md rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-100">{message}</p>}

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Updating..." : "Update password"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
