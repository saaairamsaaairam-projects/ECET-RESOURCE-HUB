import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";
import { getImageStoragePath } from "@/lib/colleges/imageService";

export async function DELETE(request: Request) {
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
          setAll() {},
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = createAdminClient();
    const { data: adminRecord } = await adminClient
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (!adminRecord) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { imageUrl, collegeId } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
    }

    const storagePath = getImageStoragePath(imageUrl);

    if (storagePath) {
      const { error: removeError } = await adminClient.storage.from("college-images").remove([storagePath]);
      if (removeError) {
        console.error("Image delete storage error:", removeError);
        return NextResponse.json({ error: removeError.message || "Image deletion failed" }, { status: 500 });
      }
    }

    if (collegeId) {
      const { data: college } = await adminClient.from("colleges").select("cover_image_url, gallery_images").eq("id", collegeId).single();

      if (college) {
        const nextGallery = (college.gallery_images ?? []).filter((item: string) => item !== imageUrl);
        const nextCover = college.cover_image_url === imageUrl ? null : college.cover_image_url;

        const { error: updateError } = await adminClient
          .from("colleges")
          .update({
            cover_image_url: nextCover,
            gallery_images: nextGallery,
            updated_at: new Date().toISOString(),
          })
          .eq("id", collegeId);

        if (updateError) {
          return NextResponse.json({ error: updateError.message || "Failed to update college image references" }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE COLLEGE IMAGE ERROR:", error);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
