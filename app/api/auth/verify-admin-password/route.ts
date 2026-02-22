import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = body;

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    // Get admin password from environment variable
    const adminPassword = process.env.ADMIN_UNLOCK_PASSWORD;

    if (!adminPassword) {
      console.error("❌ ADMIN_UNLOCK_PASSWORD not configured in environment");
      return NextResponse.json(
        { error: "Admin password not configured" },
        { status: 500 }
      );
    }

    // Verify password (constant time comparison preferred, but this is minimum)
    if (password.trim() === adminPassword.trim()) {
      console.log("✅ Admin password verified successfully");
      return NextResponse.json(
        { success: true, message: "Password verified" },
        { status: 200 }
      );
    } else {
      console.warn("⚠️ Failed admin password attempt");
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }
  } catch (err: any) {
    console.error("Error verifying admin password:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
