/**
 * Admin Authorization Utility
 * Used in server-side API routes to verify admin access
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Get lazy-initialized admin Supabase client
 * Only created when needed, avoids env var issues at module load
 */
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Verify admin authorization from request token
 * @param req - NextRequest with Authorization header
 * @returns user_id if admin, null otherwise
 */
export async function verifyAdminFromToken(
  req: NextRequest
): Promise<string | null> {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      console.error("❌ No auth token provided");
      return null;
    }

    console.log("🔍 Validating admin token...");

    // Get user from token
    const { data, error: userError } = await getSupabaseAdmin().auth.getUser(token);

    if (userError || !data?.user) {
      console.error("❌ Invalid token or user not found:", userError);
      return null;
    }

    console.log("✅ Token valid for user:", data.user.id);

    // Verify user is in admins table
    const { data: adminRecord, error: dbError } = await getSupabaseAdmin()
      .from("admins")
      .select("user_id")
      .eq("user_id", data.user.id)
      .single();

    if (dbError || !adminRecord) {
      console.error("❌ User is not an admin:", dbError);
      return null;
    }

    console.log("✅ User is admin!");
    return data.user.id;
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
