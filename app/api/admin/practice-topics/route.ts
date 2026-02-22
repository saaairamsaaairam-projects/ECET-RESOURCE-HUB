import { NextRequest, NextResponse } from "next/server";
import { verifyAdminFromToken } from "@/utils/serverAuth";
import { Validator } from "@/utils/validation";
import { supabase } from "@/utils/supabase";

export async function POST(req: NextRequest) {
  console.log("📝 [POST /api/admin/practice-topics] Creating topic...");

  // Verify admin authorization
  const userId = await verifyAdminFromToken(req);
  if (!userId) {
    console.log("❌ [POST /api/admin/practice-topics] Unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { subject_folder_id, name, slug } = await req.json();

    // Validate inputs
    const validator = new Validator();
    validator.requireString(subject_folder_id, "subject_folder_id", 1, 100);
    validator.requireString(name, "name", 1, 255);
    validator.requireString(slug, "slug", 1, 100);

    if (!validator.isValid()) {
      console.log(`⚠️ [POST /api/admin/practice-topics] Validation failed: ${validator.formatError()}`);
      return NextResponse.json(
        { error: validator.formatError() },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedName = name.trim();
    const sanitizedSlug = slug.trim().toLowerCase();

    // Check if topic already exists
    const { data: existing } = await supabase
      .from("practice_topics")
      .select("id")
      .eq("subject_folder_id", subject_folder_id)
      .eq("slug", sanitizedSlug)
      .single();

    if (existing) {
      console.log(`⚠️ [POST /api/admin/practice-topics] Topic with slug "${sanitizedSlug}" already exists`);
      return NextResponse.json(
        { error: "Topic with this slug already exists" },
        { status: 400 }
      );
    }

    // Insert topic
    const { data, error } = await supabase
      .from("practice_topics")
      .insert([
        {
          subject_folder_id,
          name: sanitizedName,
          slug: sanitizedSlug,
          order_index: 0,
        },
      ])
      .select()
      .single();

    if (error) {
      console.log(`❌ [POST /api/admin/practice-topics] DB error: ${error.message}`);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`✅ [POST /api/admin/practice-topics] Created topic: ${data.id}`);
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    console.log(`❌ [POST /api/admin/practice-topics] Error: ${err.message}`);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  console.log("📝 [PUT /api/admin/practice-topics] Updating topic...");

  const userId = await verifyAdminFromToken(req);
  if (!userId) {
    console.log("❌ [PUT /api/admin/practice-topics] Unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, name, slug } = await req.json();

    const validator = new Validator();
    validator.requireString(id, "id", 1, 100);
    validator.requireString(name, "name", 1, 255);
    if (slug) validator.requireString(slug, "slug", 1, 100);

    if (!validator.isValid()) {
      return NextResponse.json(
        { error: validator.formatError() },
        { status: 400 }
      );
    }

    const updateData: any = { name: name.trim() };
    if (slug) {
      updateData.slug = slug.trim().toLowerCase();
    }

    const { data, error } = await supabase
      .from("practice_topics")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.log(`❌ [PUT /api/admin/practice-topics] DB error: ${error.message}`);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`✅ [PUT /api/admin/practice-topics] Updated topic: ${id}`);
    return NextResponse.json(data);
  } catch (err: any) {
    console.log(`❌ [PUT /api/admin/practice-topics] Error: ${err.message}`);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  console.log("📝 [DELETE /api/admin/practice-topics] Deleting topic...");

  const userId = await verifyAdminFromToken(req);
  if (!userId) {
    console.log("❌ [DELETE /api/admin/practice-topics] Unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await req.json();

    const validator = new Validator();
    validator.requireString(id, "id", 1, 100);

    if (!validator.isValid()) {
      return NextResponse.json(
        { error: validator.formatError() },
        { status: 400 }
      );
    }

    // This triggers cascade delete of all questions
    const { error } = await supabase
      .from("practice_topics")
      .delete()
      .eq("id", id);

    if (error) {
      console.log(`❌ [DELETE /api/admin/practice-topics] DB error: ${error.message}`);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`✅ [DELETE /api/admin/practice-topics] Deleted topic: ${id}`);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.log(`❌ [DELETE /api/admin/practice-topics] Error: ${err.message}`);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
