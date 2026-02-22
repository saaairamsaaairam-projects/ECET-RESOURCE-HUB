"use client";

import { createContext, useState, useContext, ReactNode } from "react";

type AdminContextType = {
  isAdmin: boolean;
  enableAdmin: () => void;
  disableAdmin: () => void;
};

const AdminContext = createContext<AdminContextType | null>(null);

/**
 * AdminContext - UI-only state for admin features
 * NOTE: Real admin authorization is always done server-side via getUserRole()
 * This context is for UI state management only, NOT for actual auth checks
 * No localStorage - all persistence comes from server-side session
 */
export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  function enableAdmin() {
    setIsAdmin(true);
  }

  function disableAdmin() {
    setIsAdmin(false);
  }

  return (
    <AdminContext.Provider value={{ isAdmin, enableAdmin, disableAdmin }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin(): AdminContextType {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
