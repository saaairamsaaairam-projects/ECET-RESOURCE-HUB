"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin } = useAuth();

  return (
    <>
      {/* NAVBAR CONTAINER */}
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-white/5 border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* LOGO + BRAND */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-lg shadow-lg shadow-purple-500/30" />
            <span className="font-bold text-xl tracking-wide">
              PolyHub
            </span>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-8 text-gray-200">
            <Link href="/" className="hover:text-purple-300 transition">Home</Link>
            <Link href="/folder/mpc" className="hover:text-purple-300 transition">MPC</Link>
            <Link href="/folder/branch" className="hover:text-purple-300 transition">Branch</Link>
            <Link href="/tools" className="hover:text-purple-300 transition">Tools</Link>

            {/* SEARCH BUTTON */}
            <button
              onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))}
              className="p-2 hover:bg-white/10 rounded-lg transition"
            >
              <Search size={20} />
            </button>

            {/* USER DROPDOWN */}
            {user ? (
              <div className="relative group">
                <button className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition">
                  {user.email?.split("@")[0]}
                </button>

                <div className="absolute right-0 mt-2 bg-white/10 backdrop-blur-lg border border-white/10 rounded-xl hidden group-hover:block">
                  <Link href="/profile" className="block px-4 py-2 hover:bg-white/20">Profile</Link>

                  {isAdmin && (
                    <div className="block px-4 py-2 text-purple-300">
                      <span className="font-semibold">ADMIN</span>
                    </div>
                  )}

                  <Link href="/logout" className="block px-4 py-2 hover:bg-white/20">Logout</Link>
                </div>
              </div>
            ) : (
              <Link href="/login" className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition">
                Login
              </Link>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button className="md:hidden" onClick={() => setOpen(true)}>
            <Menu size={26} />
          </button>
        </div>
      </motion.nav>

      {/* ---------------- MOBILE SLIDE MENU ---------------- */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 right-0 w-[260px] h-full bg-[#1a1a2e]/80 backdrop-blur-xl z-[100] border-l border-white/10 p-6"
          >
            <div className="flex justify-end">
              <button onClick={() => setOpen(false)}>
                <X size={26} />
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-6 text-gray-200">
              <Link href="/" onClick={() => setOpen(false)}>Home</Link>
              <Link href="/folder/mpc" onClick={() => setOpen(false)}>MPC</Link>
              <Link href="/folder/branch" onClick={() => setOpen(false)}>Branch</Link>
              <Link href="/tools" onClick={() => setOpen(false)}>Tools</Link>

              <button
                onClick={() => {
                  setOpen(false);
                  document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
                }}
                className="flex items-center gap-2 hover:text-purple-300"
              >
                <Search size={20} /> Search
              </button>

              {user ? (
                <>
                  <span className="text-sm opacity-70">{user.email}</span>

                  {isAdmin && (
                    <span className="px-2 py-1 bg-purple-700 rounded-lg text-center text-sm">
                      ADMIN
                    </span>
                  )}

                  <Link href="/logout" className="mt-3 bg-white/10 px-4 py-2 rounded-lg text-center hover:bg-white/20">
                    Logout
                  </Link>
                </>
              ) : (
                <Link href="/login" className="bg-purple-600 px-4 py-2 rounded-lg text-center hover:bg-purple-700">
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
