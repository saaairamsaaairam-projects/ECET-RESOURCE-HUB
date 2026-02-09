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
      console.error("No auth token provided");
      return null;
    }

    const { data } = await supabaseAdmin.auth.getUser(token);
    if (!data?.user) {
      console.error("User not found for token");
      return null;
    }

    console.log("Checking admin status for user:", data.user.id);

    // Try profiles table first
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profile?.role === "admin") {
      console.log("User is admin via profiles table");
      return data.user.id;
    }

    // Fallback to admins table
    const { data: adminRecord, error: adminError } = await supabaseAdmin
      .from("admins")
      .select("*")
      .eq("user_id", data.user.id)
      .single();

    if (adminRecord) {
      console.log("User is admin via admins table");
      return data.user.id;
    }

    console.error("User not found in admin tables. Profile error:", profileError, "Admin error:", adminError);
    return null;
  } catch (error) {
    console.error("Admin check error:", error);
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
