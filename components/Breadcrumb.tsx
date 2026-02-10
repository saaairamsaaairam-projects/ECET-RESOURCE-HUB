"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { motion } from "framer-motion";

export default function Breadcrumb({ items }: { items: any[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 text-gray-400 mb-8 text-sm flex-wrap"
    >
      <Link
        href="/dashboard"
        className="hover:text-purple-300 transition font-medium flex items-center gap-1"
      >
        <Home size={16} /> Dashboard
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight size={16} className="text-gray-500" />
          {index === items.length - 1 ? (
            <span className="text-purple-300 font-semibold">{item.label}</span>
          ) : (
            <Link
              href={item.href}
              className="hover:text-purple-300 transition font-medium"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </motion.div>
  );
}
