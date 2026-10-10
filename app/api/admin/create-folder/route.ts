import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Avoid initializing the client at module scope: Next.js evaluates route
  // modules during build-time page-data collection, when env vars may be absent.
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
    const name = formData.get("name");
    const parentId = formData.get("parent_id");
    const file = formData.get("file");

    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Folder name required" }, { status: 400 });
    }

    if (parentId !== null && typeof parentId !== "string") {
      return NextResponse.json({ error: "Invalid parent folder" }, { status: 400 });
    }

    if (file !== null && !(file instanceof File)) {
      return NextResponse.json({ error: "Invalid thumbnail file" }, { status: 400 });
    }

    let thumbnailUrl: string | null = null;

    if (file instanceof File && file.size > 0) {
      const fileName = `${crypto.randomUUID()}-${file.name}`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from("folder_thumbnails")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Thumbnail upload failed:", uploadError);
        return NextResponse.json(
          { error: "Thumbnail upload failed" },
          { status: 500 }
        );
      }

      const { data: publicUrlData } = supabaseAdmin.storage
        .from("folder_thumbnails")
        .getPublicUrl(fileName);

      thumbnailUrl = publicUrlData.publicUrl;
    }

    const { data: folderData, error: insertError } = await supabaseAdmin
      .from("folders")
      .insert({
        name: name.trim(),
        parent_id: typeof parentId === "string" && parentId ? parentId : null,
        thumbnail: thumbnailUrl,
      })
      .select("id")
      .single();

    if (insertError || !folderData) {
      console.error("Folder creation failed:", insertError);
      return NextResponse.json(
        { error: "Folder creation failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, folderId: folderData.id });
  } catch (error) {
    console.error("Admin create-folder API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
