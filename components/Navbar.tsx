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
      {/* FIXED TOP NAV */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#0f0e17]/90 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          
          {/* BRAND */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 shadow-md shadow-purple-500/40"></div>
            <span className="text-white font-semibold text-xl tracking-wide">
              PolyHub
            </span>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-8 text-gray-300 font-medium">
            {["Home", "MPC", "Branch", "Tools"].map((item) => (
              <Link
                key={item}
                href={
                  item === "Home"
                    ? "/"
                    : item === "Branch"
                    ? "/branches"
                    : item === "MPC"
                    ? "/mpc"
                    : `/folder/${item.toLowerCase()}`
                }
                className="hover:text-purple-400 transition duration-200"
              >
                {item}
              </Link>
            ))}

            {/* SEARCH BUTTON */}
            <button
              onClick={() =>
                document.dispatchEvent(
                  new KeyboardEvent("keydown", { key: "k", ctrlKey: true })
                )
              }
              className="p-2 hover:bg-white/10 rounded-lg transition"
              suppressHydrationWarning
            >
              <Search size={20} className="text-gray-300" />
            </button>

            {/* USER MENU */}
            {user ? (
              <div className="relative group">
                <button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition">
                  {user.email?.split("@")[0]}
                </button>

                <div className="absolute right-0 mt-2 w-40 bg-[#1a1a2e] text-white border border-white/10 rounded-xl shadow-xl shadow-black/30 hidden group-hover:block">
                  <Link href="/profile" className="block px-4 py-2 hover:bg-white/10">
                    Profile
                  </Link>

                  {isAdmin && (
                    <p className="px-4 py-2 text-purple-400 font-semibold">
                      ADMIN
                    </p>
                  )}

                  <Link href="/logout" className="block px-4 py-2 hover:bg-white/10">
                    Logout
                  </Link>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-lg shadow-purple-500/30"
              >
                Login
              </Link>
            )}
          </div>

          {/* MOBILE MENU ICON */}
          <button className="md:hidden text-white" onClick={() => setOpen(true)} suppressHydrationWarning>
            <Menu size={28} />
          </button>
        </div>
      </nav>

      {/* MOBILE SLIDEOVER MENU */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-64 bg-[#1a1a2e] border-l border-white/10 z-50 p-6"
          >
            <div className="flex justify-end">
              <button onClick={() => setOpen(false)}>
                <X size={26} className="text-white" />
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-6 text-white">
              <Link href="/" onClick={() => setOpen(false)}>
                Home
              </Link>
              <Link href="/mpc" onClick={() => setOpen(false)}>
                MPC
              </Link>
                <Link href="/branches" onClick={() => setOpen(false)}>
                  Branch
              </Link>
              <Link href="/tools" onClick={() => setOpen(false)}>
                Tools
              </Link>

              {/* MOBILE SEARCH */}
              <button
                onClick={() => {
                  setOpen(false);
                  document.dispatchEvent(
                    new KeyboardEvent("keydown", { key: "k", ctrlKey: true })
                  );
                }}
                className="flex items-center gap-2"
              >
                <Search size={20} /> Search
              </button>

              {/* USER SECTION */}
              {user ? (
                <>
                  <p className="opacity-80">{user.email}</p>

                  {isAdmin && (
                    <p className="px-2 py-1 bg-purple-700 rounded-lg text-center text-sm">
                      ADMIN
                    </p>
                  )}

                  <Link href="/logout" className="bg-white/10 px-4 py-2 rounded-lg text-center">
                    Logout
                  </Link>
                </>
              ) : (
                <Link
                  href="/login"
                  className="bg-purple-600 px-4 py-2 rounded-lg text-center"
                >
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
