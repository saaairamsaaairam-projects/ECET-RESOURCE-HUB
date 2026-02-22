import { supabase } from "@/utils/supabase";
import { verifyAdminFromToken, badRequestResponse, serverErrorResponse, forbiddenResponse } from "@/utils/serverAuth";
import { Validator, sanitizeString } from "@/utils/validation";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: any) {
  try {
    // 🔐 Verify admin access
    const userId = await verifyAdminFromToken(req);
    if (!userId) {
      return forbiddenResponse();
    }

    const { id } = await params;
    const body = await req.json();

    console.log("✏️ PATCH /api/practice-questions/[id] - Updating:", { id, userId });

    // ✅ Validate id
    const validator = new Validator();
    validator.requireUUID(id, "id");

    if (!validator.isValid()) {
      return badRequestResponse(validator.formatError());
    }

    // Verify question exists
    const { data: question } = await supabase
      .from("practice_questions")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (!question) {
      return badRequestResponse("Question not found");
    }

    // Sanitize update data
    const sanitized = { ...body };
    if (sanitized.question)
      sanitized.question = sanitizeString(sanitized.question);
    if (sanitized.option_a)
      sanitized.option_a = sanitizeString(sanitized.option_a);
    if (sanitized.option_b)
      sanitized.option_b = sanitizeString(sanitized.option_b);
    if (sanitized.option_c)
      sanitized.option_c = sanitizeString(sanitized.option_c);
    if (sanitized.option_d)
      sanitized.option_d = sanitizeString(sanitized.option_d);
    if (sanitized.explanation)
      sanitized.explanation = sanitizeString(sanitized.explanation);

    const { data, error } = await supabase
      .from("practice_questions")
      .update(sanitized)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase Update Error:", error);
      return serverErrorResponse(`Failed to update question: ${error.message}`);
    }

    console.log("✅ Question updated successfully");
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("PATCH /api/practice-questions/[id] - Exception:", err);
    return serverErrorResponse(err.message || "Unknown error");
  }
}

export async function DELETE(req: NextRequest, { params }: any) {
  try {
    // 🔐 Verify admin access
    const userId = await verifyAdminFromToken(req);
    if (!userId) {
      return forbiddenResponse();
    }

    const { id } = await params;

    console.log("🗑️ DELETE /api/practice-questions/[id] - Deleting:", { id, userId });

    // ✅ Validate id
    const validator = new Validator();
    validator.requireUUID(id, "id");

    if (!validator.isValid()) {
      return badRequestResponse(validator.formatError());
    }

    // Verify question exists
    const { data: question } = await supabase
      .from("practice_questions")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (!question) {
      return badRequestResponse("Question not found");
    }

    const { error } = await supabase.from("practice_questions").delete().eq("id", id);

    if (error) {
      console.error("Supabase Delete Error:", error);
      return serverErrorResponse(`Failed to delete question: ${error.message}`);
    }

    console.log("✅ Question deleted successfully");
    return NextResponse.json({ success: true, message: "Question deleted" }, { status: 200 });
  } catch (err: any) {
    console.error("DELETE /api/practice-questions/[id] - Exception:", err);
    return serverErrorResponse(err.message || "Unknown error");
  }
}
