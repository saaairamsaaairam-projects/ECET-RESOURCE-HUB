import { NextResponse } from "next/server";

export async function GET() {
  const info = {
    ok: true,
    NODE_ENV: process.env.NODE_ENV || null,
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  console.log("/api/debug called", info);

  return NextResponse.json(info);
}
