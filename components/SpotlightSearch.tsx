"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import Link from "next/link";

export default function SpotlightSearch() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-start pt-20"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/20 w-full max-w-lg"
            >
              <div className="flex items-center bg-white/10 border border-white/20 px-3 py-2 rounded-lg">
                <Search className="text-gray-300" />
                <input
                  autoFocus
                  placeholder="Search subject, file, material..."
                  className="bg-transparent outline-none ml-3 text-white w-full"
                />
              </div>

              <div className="mt-4 space-y-2">
                <Link
                  href="/folder/mpc"
                  className="block bg-white/5 hover:bg-white/10 px-3 py-2 rounded-md text-gray-200"
                >
                  MPC Materials
                </Link>
                <Link
                  href="/folder/branch"
                  className="block bg-white/5 hover:bg-white/10 px-3 py-2 rounded-md text-gray-200"
                >
                  Branch Materials
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
