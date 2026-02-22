import { supabase } from "@/utils/supabase";
import { verifyAdminFromToken, badRequestResponse, serverErrorResponse, forbiddenResponse } from "@/utils/serverAuth";
import { Validator, sanitizeString, sanitizeSubject } from "@/utils/validation";
import { PracticeTopic, CreateTopicRequest, UpdateTopicRequest, DeleteTopicRequest } from "@/types/database";
import { NextRequest, NextResponse } from "next/server";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const subject = searchParams.get("subject");

    let query = supabase.from("practice_topics").select("*");

    if (slug && subject) {
      const sanitizedSubject = sanitizeSubject(subject);
      if (!sanitizedSubject) {
        return NextResponse.json({ error: "Invalid subject" }, { status: 400 });
      }
      query = query.eq("slug", slug).eq("subject", sanitizedSubject);
    } else if (subject) {
      const sanitizedSubject = sanitizeSubject(subject);
      if (!sanitizedSubject) {
        return NextResponse.json({ error: "Invalid subject" }, { status: 400 });
      }
      query = query.eq("subject", sanitizedSubject).order("name");
    }

    const { data, error } = await query;

    if (error) {
      console.error("GET /api/practice-topics - DB Error:", error);
      return serverErrorResponse(error.message);
    }

    // Return single or array based on query
    if (slug && subject) {
      return NextResponse.json(data?.[0] || null, { status: 200 });
    }

    return NextResponse.json(data || [], { status: 200 });
  } catch (err: any) {
    console.error("GET /api/practice-topics - Exception:", err);
    return serverErrorResponse(err.message || "Unknown error");
  }
}

export async function POST(req: NextRequest) {
  try {
    // 🔐 Verify admin access
    const userId = await verifyAdminFromToken(req);
    if (!userId) {
      return forbiddenResponse();
    }

    const body = await req.json();
    const { subject, name } = body as CreateTopicRequest;

    console.log("📝 POST /api/practice-topics - Creating topic:", { subject, name, userId });

    // ✅ Validate inputs
    const validator = new Validator();
    validator.requireSubject(subject);
    validator.requireString(name, "name", 1, 100);

    if (!validator.isValid()) {
      console.error("Validation failed:", validator.formatError());
      return badRequestResponse(validator.formatError());
    }

    const slug = generateSlug(name);
    console.log("Generated slug:", slug);

    // Check if topic already exists
    const { data: existing } = await supabase
      .from("practice_topics")
      .select("id")
      .eq("subject", subject)
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      return badRequestResponse(`Topic "${name}" already exists for subject "${subject}"`);
    }

    const { data, error } = await supabase
      .from("practice_topics")
      .insert([{ subject, name: sanitizeString(name), slug }])
      .select()
      .single();

    if (error) {
      console.error("Supabase Insert Error:", error);
      return serverErrorResponse(`Failed to create topic: ${error.message}`);
    }

    console.log("✅ Topic created successfully:", data);
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/practice-topics - Exception:", err);
    return serverErrorResponse(err.message || "Unknown error");
  }
}

export async function PUT(req: NextRequest) {
  try {
    // 🔐 Verify admin access
    const userId = await verifyAdminFromToken(req);
    if (!userId) {
      return forbiddenResponse();
    }

    const body = await req.json();
    const { id, name } = body as UpdateTopicRequest;

    console.log("✏️ PUT /api/practice-topics - Updating topic:", { id, name, userId });

    // ✅ Validate inputs
    const validator = new Validator();
    validator.requireUUID(id, "id");
    validator.requireString(name, "name", 1, 100);

    if (!validator.isValid()) {
      console.error("Validation failed:", validator.formatError());
      return badRequestResponse(validator.formatError());
    }

    // Fetch current topic
    const { data: currentTopic, error: fetchError } = await supabase
      .from("practice_topics")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !currentTopic) {
      return badRequestResponse("Topic not found");
    }

    const slug = generateSlug(name);

    const { data, error } = await supabase
      .from("practice_topics")
      .update({ name: sanitizeString(name), slug, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase Update Error:", error);
      return serverErrorResponse(`Failed to update topic: ${error.message}`);
    }

    console.log("✅ Topic updated successfully:", data);
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("PUT /api/practice-topics - Exception:", err);
    return serverErrorResponse(err.message || "Unknown error");
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // 🔐 Verify admin access
    const userId = await verifyAdminFromToken(req);
    if (!userId) {
      return forbiddenResponse();
    }

    const body = await req.json();
    const { id } = body as DeleteTopicRequest;

    console.log("🗑️ DELETE /api/practice-topics - Deleting topic:", { id, userId });

    // ✅ Validate inputs
    const validator = new Validator();
    validator.requireUUID(id, "id");

    if (!validator.isValid()) {
      console.error("Validation failed:", validator.formatError());
      return badRequestResponse(validator.formatError());
    }

    // Verify topic exists
    const { data: topic } = await supabase
      .from("practice_topics")
      .select("id, name")
      .eq("id", id)
      .maybeSingle();

    if (!topic) {
      return badRequestResponse("Topic not found");
    }

    // Delete associated questions first
    await supabase.from("practice_questions").delete().eq("topic_id", id);

    // Then delete topic
    const { error } = await supabase.from("practice_topics").delete().eq("id", id);

    if (error) {
      console.error("Supabase Delete Error:", error);
      return serverErrorResponse(`Failed to delete topic: ${error.message}`);
    }

    console.log("✅ Topic and associated questions deleted successfully");
    return NextResponse.json({ success: true, message: "Topic deleted" }, { status: 200 });
  } catch (err: any) {
    console.error("DELETE /api/practice-topics - Exception:", err);
    return serverErrorResponse(err.message || "Unknown error");
  }
}
