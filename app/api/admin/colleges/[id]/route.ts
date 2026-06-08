import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";
import { deleteCollege, updateCollegeStatus, updateCollege, getCollegeById } from "@/lib/colleges/repository";

async function ensureAdmin() {
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
    return { ok: false, status: 401, error: "Unauthorized" } as const;
  }

  const adminClient = createAdminClient();
  const { data: adminRecord } = await adminClient.from("admins").select("user_id").eq("user_id", user.id).single();
  if (!adminRecord) {
    return { ok: false, status: 403, error: "Forbidden" } as const;
  }

  return { ok: true, adminClient } as const;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await ensureAdmin();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const college = await getCollegeById(id, auth.adminClient);
    if (!college) {
      return NextResponse.json({ error: "College not found" }, { status: 404 });
    }

    const { data: cutoffs, error: cutoffError } = await auth.adminClient
      .from("ecet_cutoffs")
      .select("*")
      .eq("college_id", id)
      .order("year", { ascending: false });

    if (cutoffError) {
      throw cutoffError;
    }

    return NextResponse.json({ college: { ...college, ecet_cutoffs: cutoffs } }, { status: 200 });
  } catch (error) {
    console.error("GET COLLEGE ERROR:", error);
    return NextResponse.json({ error: "Failed to load college" }, { status: 500 });
  }
}

type EcetCutoffPayload = {
  branch: string;
  year: number;
  closing_rank: number;
};

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await ensureAdmin();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const payload = await request.json();
    const college = await updateCollege(id, payload, auth.adminClient);

    if (Array.isArray(payload.gallery_images)) {
      try {
        await auth.adminClient.from("college_images").delete().eq("college_id", id);

        const galleryRows = (payload.gallery_images as string[])
          .filter(Boolean)
          .map((imageUrl, index) => ({
            college_id: id,
            image_url: imageUrl,
            sort_order: index,
          }));

        if (galleryRows.length > 0) {
          const { error: galleryError } = await auth.adminClient.from("college_images").insert(galleryRows);
          if (galleryError) {
            throw galleryError;
          }
        }
      } catch (galleryError) {
        console.warn("college_images sync skipped:", galleryError);
      }
    }

    if (Array.isArray(payload.ecet_cutoffs)) {
      const { error: deleteError } = await auth.adminClient
        .from("ecet_cutoffs")
        .delete()
        .eq("college_id", id);

      if (deleteError) {
        throw deleteError;
      }

      const rawCutoffs = payload.ecet_cutoffs as EcetCutoffPayload[];
      const cutoffRows = rawCutoffs
        .filter((row) => row?.branch && Number.isFinite(Number(row.year)) && Number(row.closing_rank) > 0)
        .map((row) => ({
          college_id: id,
          branch: row.branch,
          year: Number(row.year),
          closing_rank: Number(row.closing_rank),
        }));

      if (cutoffRows.length > 0) {
        const { error: insertError } = await auth.adminClient.from("ecet_cutoffs").insert(cutoffRows);
        if (insertError) {
          throw insertError;
        }
      }
    }

    return NextResponse.json({ college }, { status: 200 });
  } catch (error) {
    console.error("UPDATE COLLEGE ERROR:", error);
    const message = error instanceof Error ? error.message : "Failed to update college";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await ensureAdmin();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { status } = await request.json();
    const college = await updateCollegeStatus(id, status, auth.adminClient);
    return NextResponse.json({ college }, { status: 200 });
  } catch (error) {
    console.error("UPDATE COLLEGE STATUS ERROR:", error);
    return NextResponse.json({ error: "Failed to update college" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await ensureAdmin();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    await deleteCollege(id, auth.adminClient);
    return NextResponse.json({ success: true, deleted: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE COLLEGE ERROR:", error);
    return NextResponse.json({ error: "Failed to delete college" }, { status: 500 });
  }
}
