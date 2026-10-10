import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Route modules are evaluated during build-time page-data collection.
  // Create the privileged client only when the route is invoked.
  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

async function checkAdmin(
  req: NextRequest,
  supabaseAdmin: NonNullable<ReturnType<typeof getSupabaseAdmin>>
): Promise<string | null> {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\\s+/i, "").trim();

    if (!token) {
      console.error("No auth token provided");
      return null;
    }

    const { data, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !data?.user) {
      console.error("Invalid token or user not found:", userError);
      return null;
    }

    const { data: adminRecord, error: dbError } = await supabaseAdmin
      .from("admins")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (dbError) {
      console.error("Admin lookup failed:", dbError);
      return null;
    }

    return adminRecord ? data.user.id : null;
  } catch (error) {
    console.error("Admin check error:", error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable"
    );
    return NextResponse.json(
      { error: "Server Supabase configuration is missing" },
      { status: 500 }
    );
  }

  try {
    const userId = await checkAdmin(req, supabaseAdmin);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const folderId = formData.get("folder_id");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "File required" }, { status: 400 });
    }

    if (typeof folderId !== "string" || !folderId.trim()) {
      return NextResponse.json({ error: "Folder ID required" }, { status: 400 });
    }

    const fileExt = file.name.includes(".") ? file.name.split(".").pop() : "bin";
    const fileName = `${crypto.randomUUID()}.${fileExt || "bin"}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("folder_files")
      .upload(fileName, file);

    if (uploadError) {
      console.error("File upload failed:", uploadError);
      return NextResponse.json({ error: "File upload failed" }, { status: 500 });
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from("folder_files")
      .getPublicUrl(fileName);

    const { error: insertError } = await supabaseAdmin.from("files").insert({
      folder_id: folderId,
      file_name: file.name,
      file_url: publicUrlData.publicUrl,
    });

    if (insertError) {
      console.error("File metadata insert failed:", insertError);
      return NextResponse.json(
        { error: "Failed to save file metadata" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin upload-file API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
