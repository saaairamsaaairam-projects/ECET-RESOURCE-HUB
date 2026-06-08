"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    async function logout() {
      try {
        await supabase.auth.signOut({ scope: "global" });
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });
      } catch (err) {
        console.error("Logout error:", err);
      } finally {
        if (isMounted) {
          router.replace("/login");
        }
      }
    }

    logout();
    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0f0e17] text-white flex items-center justify-center">Signing you out...</div>
  );
}
