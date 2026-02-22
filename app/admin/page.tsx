"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { FolderPlus, Upload, Settings } from "lucide-react";

const adminTools = [
  {
    title: "Create Folder",
    description: "Create individual folders one at a time",
    href: "/admin/create-folder",
    icon: FolderPlus,
    color: "from-purple-600 to-fuchsia-600",
  },
  {
    title: "Bulk Create Folders",
    description: "Parse syllabus & auto-generate folder structure",
    href: "/admin/bulk-folder-create",
    icon: FolderPlus,
    color: "from-blue-600 to-cyan-600",
  },
  {
    title: "Upload Files",
    description: "Upload study materials to folders",
    href: "/admin/upload-file",
    icon: Upload,
    color: "from-green-600 to-emerald-600",
  },
  {
    title: "Rename Folder",
    description: "Update folder names",
    href: "/admin/rename-folder",
    icon: Settings,
    color: "from-orange-600 to-red-600",
  },
  {
    title: "Rename File",
    description: "Update file names",
    href: "/admin/rename-file",
    icon: Settings,
    color: "from-pink-600 to-rose-600",
  },
  {
    title: "Practice Topics",
    description: "Manage practice topics for Practice Bits",
    href: "/admin/practice-topics",
    icon: Settings,
    color: "from-purple-600 to-fuchsia-600",
  },
  {
    title: "Practice Questions",
    description: "Manage practice questions (MCQs)",
    href: "/admin/practice-questions",
    icon: Settings,
    color: "from-purple-600 to-fuchsia-600",
  },
];

export default function AdminDashboard() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0f0e17] text-white pt-24 px-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">Only admins can access the admin panel.</p>
          <Link href="/" className="px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 inline-block">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0e17] text-white pt-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text mb-3">
            Admin Dashboard
          </h1>
          <p className="text-gray-400">
            Manage PolyHub folders, files, and resources from here.
          </p>
        </motion.div>

        {/* TOOLS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {adminTools.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={tool.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05 }}
              >
                <Link href={tool.href} className="block h-full">
                  <div
                    className={`h-full p-6 rounded-xl bg-gradient-to-br ${tool.color} bg-opacity-10 border border-white/10 hover:border-white/30 transition cursor-pointer`}
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${tool.color} rounded-lg flex items-center justify-center mb-4`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{tool.title}</h3>
                    <p className="text-sm text-gray-400">{tool.description}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* QUICK TIPS */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-6 bg-white/5 border border-white/10 rounded-xl"
        >
          <h3 className="text-lg font-semibold mb-3">Quick Tips:</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>✓ Use <strong>Bulk Create Folders</strong> to generate entire syllabus structures instantly</li>
            <li>✓ Indent with 2 spaces to create nested folders</li>
            <li>✓ Always use <strong>Create Folder</strong> for single new folders</li>
            <li>✓ Use <strong>Upload Files</strong> to add study materials to existing folders</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
