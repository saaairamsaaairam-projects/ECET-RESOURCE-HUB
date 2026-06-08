"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/utils/supabase";

type AuthContextType = {
  user: any;
  isAdmin: boolean;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  async function fetchCurrentUser() {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (data.user) {
        setUser(data.user);
        setIsAdmin(Boolean(data.isAdmin));
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    } catch (err) {
      console.error("❌ Error fetching current user:", err);
      setUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCurrentUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchCurrentUser();
    });

    return () => subscription.unsubscribe();
  }, [pathname]);


  return (
    <AuthContext.Provider value={{ user, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
