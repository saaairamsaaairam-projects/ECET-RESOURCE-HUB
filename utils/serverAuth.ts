/**
 * Admin Authorization Utility
 * Used in server-side API routes to verify admin access
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Get lazy-initialized admin Supabase client
 * Only created when needed, avoids env var issues at module load
 */
function getSupabaseAdmin() {
  // For service role operations (direct DB access)
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Verify admin authorization from request cookies
 * @param req - NextRequest with authentication cookies
 * @returns user_id if admin, null otherwise
 */
export async function verifyAdminFromToken(
  req: NextRequest
): Promise<string | null> {
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

    console.log("🔍 Validating admin access from cookies...");

    // Get user from session cookies
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("❌ No authenticated user found:", userError);
      return null;
    }

    console.log("✅ User authenticated:", user.email);

    // Verify user is in admins table
    const { data: adminRecord, error: dbError } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (dbError || !adminRecord) {
      console.error("❌ User is not an admin:", dbError);
      return null;
    }

    console.log("✅ User is admin!");
    return user.id;
  } catch (err) {
    console.error("❌ Admin verification error:", err);
    return null;
  }
}

/**
 * Return 403 Forbidden response
 */
export function forbiddenResponse() {
  return NextResponse.json(
    { error: "Forbidden - Admin access required" },
    { status: 403 }
  );
}

/**
 * Return 400 Bad Request response
 */
export function badRequestResponse(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

/**
 * Return 500 Server Error response
 */
export function serverErrorResponse(message: string) {
  return NextResponse.json({ error: message }, { status: 500 });
}

/**
 * Get admin client for server components
 * Returns Supabase admin client for server-side queries
 */
export function getAdminClient() {
  return getSupabaseAdmin();
}

/**
 * Check if user is admin (server-side)
 * @param userId - User ID to check
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("admins")
      .select("user_id")
      .eq("user_id", userId)
      .single();
    return !!data && !error;
  } catch {
    return false;
  }
}
