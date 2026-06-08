import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";
import { createCollege, getAllColleges } from "@/lib/colleges/repository";

export async function GET() {
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
    const { data: adminRecord } = await adminClient.from("admins").select("user_id").eq("user_id", user.id).single();
    if (!adminRecord) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const colleges = await getAllColleges(adminClient);
    return NextResponse.json({ colleges }, { status: 200 });
  } catch (error) {
    console.error("LIST COLLEGES ERROR:", error);
    return NextResponse.json({ error: "Failed to list colleges" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
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

    console.error("CREATE COLLEGE AUTH USER:", { user, userError });

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = createAdminClient();
    const { data: adminRecord, error: adminError } = await adminClient
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    console.error("CREATE COLLEGE ADMIN RECORD:", { adminRecord, adminError });

    if (!adminRecord) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.error("REQUEST BODY (api/admin/colleges):", payload);

    const normalizedSlug = String(payload.slug ?? "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    if (!normalizedSlug) {
      return NextResponse.json({ success: false, error: "A valid slug is required." }, { status: 400 });
    }

    // Basic validation to catch missing Step 2 values during debugging
    if (!payload.placements || !payload.placements.averagePackage) {
      console.error("MISSING_PLACEMENTS_IN_REQUEST:", payload.placements);
      return NextResponse.json({ success: false, error: "Placements missing in request" }, { status: 400 });
    }
    if (!payload.fees || !payload.fees.tuition) {
      console.error("MISSING_FEES_IN_REQUEST:", payload.fees);
      return NextResponse.json({ success: false, error: "Fees missing in request" }, { status: 400 });
    }

    const college = await createCollege(
      {
        name: payload.name,
        slug: normalizedSlug,
        branches: Array.isArray(payload.branches) ? payload.branches : [],
        location: payload.location,
        district: payload.district,
        university: payload.university,
        naac_grade: payload.naac_grade,
        website: payload.website,
        description: payload.description,
        status: payload.status,
        cover_image_url: payload.cover_image_url,
        gallery_images: Array.isArray(payload.gallery_images) ? payload.gallery_images : [],
        facilities: Array.isArray(payload.facilities) ? payload.facilities : [],
        student_insights: payload.student_insights,
        placements: payload.placements,
        fees: payload.fees,
        verification_status: payload.verification_status,
        last_verified: payload.last_verified,
        source_url: payload.source_url,
      },
      adminClient
    );

    if (Array.isArray(payload.ecet_cutoffs) && payload.ecet_cutoffs.length > 0) {
      const cutoffRows = payload.ecet_cutoffs
        .filter((row: { branch?: string; year?: number; closing_rank?: number }) => row?.branch && Number.isFinite(Number(row.year)) && Number(row.closing_rank) > 0)
        .map((row: { branch: string; year: number; closing_rank: number }) => ({
          college_id: college.id,
          branch: row.branch,
          year: Number(row.year),
          closing_rank: Number(row.closing_rank),
        }));

      if (cutoffRows.length > 0) {
        const { error: cutoffError } = await adminClient.from("ecet_cutoffs").insert(cutoffRows);
        if (cutoffError) {
          throw cutoffError;
        }
      }
    }

    console.error("CREATE COLLEGE SUCCESS:", college);
    return NextResponse.json({ success: true, college }, { status: 201 });
  } catch (error) {
    console.error("CREATE COLLEGE ERROR:", error);

    const message = error instanceof Error ? error.message : String(error);
    const status = message.toLowerCase().includes("already exists") ? 409 : 500;

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status }
    );
  }
}
