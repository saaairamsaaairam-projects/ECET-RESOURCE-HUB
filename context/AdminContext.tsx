"use client";

import { createContext, useState, useContext, ReactNode, useEffect } from "react";

type AdminContextType = {
  isAdmin: boolean;
  enableAdmin: () => void;
  disableAdmin: () => void;
};

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Load admin state from localStorage on mount (client-side only)
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("adminMode");
      if (saved === "true") {
        setIsAdmin(true);
      }
    }
  }, []);

  function enableAdmin() {
    setIsAdmin(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("adminMode", "true");
    }
  }

  function disableAdmin() {
    setIsAdmin(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("adminMode", "false");
    }
  }

  return (
    <AdminContext.Provider value={{ isAdmin, enableAdmin, disableAdmin }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext)!;
}
