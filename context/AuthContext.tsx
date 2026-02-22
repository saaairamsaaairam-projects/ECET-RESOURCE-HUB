"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

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

  // Fetch user from server API on mount
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  async function fetchCurrentUser() {
    try {
      // Call server-side API that reads from cookies + database
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include", // Include cookies
      });

      const data = await response.json();

      if (data.user) {
        setUser(data.user);
        setIsAdmin(data.isAdmin || false);
        console.log("✅ User loaded from server:", data.user.email, "Role:", data.role);
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
