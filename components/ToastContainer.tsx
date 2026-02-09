"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/context/ToastContext";
import { Check, X, AlertCircle, Info } from "lucide-react";

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <Check size={20} />;
      case "error":
        return <X size={20} />;
      case "warning":
        return <AlertCircle size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-600/90 text-white border-green-500";
      case "error":
        return "bg-red-600/90 text-white border-red-500";
      case "warning":
        return "bg-yellow-600/90 text-white border-yellow-500";
      default:
        return "bg-blue-600/90 text-white border-blue-500";
    }
  };

  return (
    <div className="fixed top-6 right-6 z-[9999] pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: "spring", damping: 15, stiffness: 100 }}
            className={`mb-3 p-4 rounded-lg border backdrop-blur-xl flex items-center gap-3 pointer-events-auto max-w-sm ${getColors(
              toast.type
            )} shadow-xl`}
          >
            <div className="flex-shrink-0">{getIcon(toast.type)}</div>
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-lg opacity-70 hover:opacity-100 transition ml-2"
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
