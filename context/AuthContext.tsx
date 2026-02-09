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
      console.log("🔍 Checking admin status for user:", userId);
      
      // Check admins table directly
      const { data, error } = await supabase
        .from("admins")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.log("ℹ️ User not found in admins table (this is normal for non-admin users)");
        setIsAdmin(false);
        return;
      }

      if (data) {
        console.log("✅ User is admin!");
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (err) {
      console.error("❌ Error checking admin status:", err);
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
