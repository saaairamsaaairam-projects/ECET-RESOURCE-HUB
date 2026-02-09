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
    const name = formData.get("name") as string;
    const parent_id = formData.get("parent_id") as string | null;
    const file = formData.get("file") as File | null;

    if (!name) {
      return NextResponse.json({ error: "Folder name required" }, { status: 400 });
    }

    let thumbnailUrl = null;

    if (file) {
      const fileName = `${crypto.randomUUID()}-${file.name}`;

      const { data, error: uploadError } = await supabaseAdmin.storage
        .from("folder_thumbnails")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Upload failed:", uploadError);
        return NextResponse.json(
          { error: `Upload failed: ${uploadError.message}` },
          { status: 500 }
        );
      }

      const { data: publicUrlData } = supabaseAdmin.storage
        .from("folder_thumbnails")
        .getPublicUrl(fileName);

      thumbnailUrl = publicUrlData.publicUrl;
    }

    const { error: insertError } = await supabaseAdmin.from("folders").insert({
      name,
      parent_id: parent_id || null,
      thumbnail: thumbnailUrl,
    });

    if (insertError) {
      console.error("Folder creation failed:", insertError);
      return NextResponse.json(
        { error: `Folder creation failed: ${insertError.message}` },
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
