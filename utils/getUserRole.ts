import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function getUserRole() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // This is expected when called from a Server Component
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("🔍 SERVER USER:", user?.id || "NO USER"); // DEBUG

  if (!user) return null;

  const { data } = await supabase
    .from("admins")
    .select("*")
    .eq("user_id", user.id)
    .single();

  console.log("📊 ADMIN DATA:", data ? "FOUND" : "NOT FOUND"); // DEBUG

  return data ? "admin" : "user";
}
