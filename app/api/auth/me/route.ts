import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/auth/me
 * Returns current user and their role from server-side session + database
 * No client-side storage, everything is server-managed cookies + database
 */
export async function GET(request: NextRequest) {
  try {
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
              // Expected in server context
            }
          },
        },
      }
    );

    // Get user from session cookies (server-side only)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ user: null, role: null });
    }

    // Check admin status in database
    const { data: adminData } = await supabase
      .from("admins")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const role = adminData ? "admin" : "user";

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
      },
      role,
      isAdmin: role === "admin",
    });
  } catch (error) {
    console.error("Error in /api/auth/me:", error);
    return NextResponse.json({ user: null, role: null }, { status: 500 });
  }
}
