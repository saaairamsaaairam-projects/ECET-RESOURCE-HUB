import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkAdmin(req: NextRequest): Promise<string | null> {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      console.error("❌ No auth token provided");
      return null;
    }

    console.log("🔍 Validating token...");
    const { data, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !data?.user) {
      console.error("❌ Invalid token or user not found:", userError);
      return null;
    }

    console.log("✅ Token valid for user:", data.user.id);

    // Check admins table directly (this is the authoritative source)
    const { data: adminRecord, error: dbError } = await supabaseAdmin
      .from("admins")
      .select("user_id")
      .eq("user_id", data.user.id)
      .single();

    if (dbError) {
      console.error("❌ Database query error:", dbError);
      return null;
    }

    if (adminRecord) {
      console.log("✅ User is admin!");
      return data.user.id;
    }

    console.error("❌ User not found in admins table");
    return null;
  } catch (error) {
    console.error("❌ Admin check error:", error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await checkAdmin(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder_id = formData.get("folder_id") as string | null;

    if (!file) {
      return NextResponse.json({ error: "File required" }, { status: 400 });
    }

    if (!folder_id) {
      return NextResponse.json({ error: "Folder ID required" }, { status: 400 });
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;

    // Upload to Supabase Storage using admin client
    const { data, error: uploadError } = await supabaseAdmin.storage
      .from("folder_files")
      .upload(fileName, file);

    if (uploadError) {
      console.error("Upload failed:", uploadError);
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public file URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from("folder_files")
      .getPublicUrl(fileName);

    const publicURL = publicUrlData.publicUrl;

    // Save metadata to DB
    const { error: insertError } = await supabaseAdmin.from("files").insert({
      folder_id,
      file_name: file.name,
      file_url: publicURL,
    });

    if (insertError) {
      console.error("Insert failed:", insertError);
      return NextResponse.json(
        { error: `Failed to save file metadata: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
