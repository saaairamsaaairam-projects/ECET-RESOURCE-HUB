"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/utils/supabase";

type AuthContextType = {
  user: any;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Load session on start
  useEffect(() => {
    checkUser();

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) getUserRole(session.user.id);
    });
  }, []);

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user || null);

    if (user) getUserRole(user.id);
  }

  async function getUserRole(userId: string) {
    try {
      // Try to fetch from profiles table
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (!error && data?.role === "admin") {
        setIsAdmin(true);
        return;
      }

      // Fallback: check admins table if profiles doesn't work or user is not admin
      const { data: adminData } = await supabase
        .from("admins")
        .select("*")
        .eq("user_id", userId)
        .single();

      setIsAdmin(!!adminData);
    } catch (err) {
      console.error("Error checking admin status:", err);
      setIsAdmin(false);
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin }}>
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
