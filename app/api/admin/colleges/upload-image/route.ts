import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";

const STORAGE_BUCKET = "college-images";

export async function POST(req: NextRequest) {
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

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

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

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File required" }, { status: 400 });
    }

    const { error: bucketLookupError } = await adminClient.storage.getBucket(STORAGE_BUCKET);

    if (bucketLookupError && (bucketLookupError.message?.toLowerCase().includes("not found") || bucketLookupError.status === 404)) {
      const { error: createBucketError } = await adminClient.storage.createBucket(STORAGE_BUCKET, {
        public: true,
        fileSizeLimit: "10MB",
      });

      if (createBucketError) {
        console.error("College image bucket creation failed:", createBucketError);
        return NextResponse.json(
          { error: `Storage bucket is unavailable: ${createBucketError.message}` },
          { status: 500 }
        );
      }
    } else if (bucketLookupError) {
      console.error("College image bucket lookup failed:", bucketLookupError);
      return NextResponse.json(
        { error: `Storage bucket is unavailable: ${bucketLookupError.message}` },
        { status: 500 }
      );
    }

    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `${crypto.randomUUID()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError || !uploadData) {
      console.error("College image upload failed:", uploadError);
      return NextResponse.json(
        { error: uploadError?.message || "Image upload failed." },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = adminClient.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName);

    return NextResponse.json({ imageUrl: publicUrlData.publicUrl }, { status: 200 });
  } catch (error) {
    console.error("College image upload API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
