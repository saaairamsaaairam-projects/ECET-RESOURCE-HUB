"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";

interface ParsedFolder {
  name: string;
  level: number;
}

export default function BulkFolderCreate() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState<ParsedFolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0f0e17] text-white pt-24 px-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="mb-6">Only admins can access this page.</p>
          <Link href="/" className="px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  function parseInput() {
    const lines = input.split("\n").filter((l) => l.trim().length > 0);

    const parsed: ParsedFolder[] = [];

    for (const line of lines) {
      const leadingSpaces = line.match(/^\s*/)?.[0].length || 0;
      const level = Math.floor(leadingSpaces / 2); // 2 spaces = 1 level
      const name = line.trim();

      parsed.push({
        name,
        level,
      });
    }

    setParsed(parsed);
    setError("");
  }

  async function createFolders() {
    if (parsed.length === 0) {
      setError("No folders to create");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Get session token for authorization
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError("Not authenticated. Please log in again.");
        setLoading(false);
        return;
      }

      const folderIdMap = new Map<number, string>(); // index -> folderId
      let createdCount = 0;

      for (let i = 0; i < parsed.length; i++) {
        const folder = parsed[i];

        // Find parent folder ID from the previous folder at level-1
        let parentId: string | null = null;

        if (folder.level > 0) {
          // Search backwards for a folder at level-1
          for (let j = i - 1; j >= 0; j--) {
            if (parsed[j].level === folder.level - 1) {
              parentId = folderIdMap.get(j) || null;
              break;
            }
          }
        }

        // Create FormData
        const formData = new FormData();
        formData.append("name", folder.name);
        if (parentId) {
          formData.append("parent_id", parentId);
        }

        const response = await fetch("/api/admin/create-folder", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || `Failed to create folder: ${folder.name}`);
        }

        const data = await response.json();
        if (data.folderId) {
          folderIdMap.set(i, data.folderId);
          createdCount++;
        }
      }

      setSuccess(`✓ Successfully created ${createdCount} folder${createdCount !== 1 ? "s" : ""}!`);
      setInput("");
      setParsed([]);

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to create folders");
      console.error("Bulk create error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0e17] text-white pt-24 px-6">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-purple-400 hover:text-purple-300 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text mb-2">
            Bulk Folder Creator
          </h1>
          <p className="text-gray-400">
            Paste a folder structure (indent with 2 spaces for nested folders) and PolyHub will auto-generate them.
          </p>
        </div>

        {/* INPUT SECTION */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <label className="block text-sm font-semibold mb-3">Paste Folder Structure:</label>
          <textarea
            className="w-full h-80 p-4 rounded-xl bg-white/5 border border-white/20 focus:border-purple-500 outline-none text-white placeholder-gray-500"
            placeholder="Example:
Computer Science & Engineering
  Programming (C/Java)
  Operating Systems
  DBMS
  Computer Networks
Electronics & Communication
  Circuit Analysis
  Digital Electronics"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </motion.div>

        {/* BUTTONS */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <button
            onClick={parseInput}
            disabled={input.length === 0}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 font-semibold transition"
          >
            Preview Folders
          </button>

          {parsed.length > 0 && (
            <button
              onClick={createFolders}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:opacity-50 font-semibold transition"
            >
              {loading ? "Creating..." : `Create ${parsed.length} Folder${parsed.length !== 1 ? "s" : ""}`}
            </button>
          )}
        </div>

        {/* MESSAGES */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500 text-red-300"
          >
            ❌ {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg bg-green-500/20 border border-green-500 text-green-300"
          >
            {success}
          </motion.div>
        )}

        {/* PREVIEW */}
        {parsed.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-xl font-semibold mb-4">Preview ({parsed.length} folders):</h2>

            <div className="space-y-2 bg-white/5 p-6 rounded-xl border border-white/10">
              {parsed.map((folder, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-center p-3 bg-white/10 rounded-lg border border-white/10 hover:border-purple-400 transition"
                  style={{ marginLeft: `${folder.level * 24}px` }}
                >
                  <span className="text-gray-400 mr-3">{"└─"}</span>
                  <span className="font-medium">{folder.name}</span>
                  <span className="ml-auto text-xs text-gray-500">Level {folder.level}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
