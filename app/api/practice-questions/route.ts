import { supabase } from "@/utils/supabase";
import { verifyAdminFromToken, badRequestResponse, serverErrorResponse, forbiddenResponse } from "@/utils/serverAuth";
import { Validator, sanitizeString } from "@/utils/validation";
import { PracticeQuestion, CreateQuestionRequest, UpdateQuestionRequest, DeleteQuestionRequest } from "@/types/database";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const topicId = searchParams.get("topic_id") || searchParams.get("topicId");
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = 50;

    const from = (page - 1) * pageSize;
    const to = page * pageSize - 1;

    let query = supabase
      .from("practice_questions")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: true }); // new questions go last

    if (topicId) {
      // Validate topic_id is UUID
      const validator = new Validator();
      if (!validator.requireUUID(topicId, "topic_id") || !validator.isValid()) {
        return NextResponse.json({ error: "Invalid topic_id" }, { status: 400 });
      }
      query = query.eq("topic_id", topicId);
    }

    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error("GET /api/practice-questions - DB Error:", error);
      return serverErrorResponse(error.message);
    }

    return NextResponse.json(
      {
        questions: data || [],
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil((count || 0) / pageSize)),
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("GET /api/practice-questions - Exception:", err);
    return serverErrorResponse(err.message || "Unknown error");
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // 🔐 Verify admin access
    const userId = await verifyAdminFromToken(req);
    if (!userId) return forbiddenResponse();

    const body = await req.json();
    const { id, updates } = body as { id: string; updates: any };

    if (!id || !updates) {
      return badRequestResponse("Missing id or updates");
    }

    const { data, error } = await supabase
      .from("practice_questions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("PATCH /api/practice-questions - Error:", error);
      return serverErrorResponse(error.message || "Failed to update");
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err: any) {
    console.error("PATCH /api/practice-questions - Exception:", err);
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
    const {
      topic_id,
      question,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_option,
      explanation,
    } = body as CreateQuestionRequest;

    console.log("📝 POST /api/practice-questions - Creating question:", { topic_id, userId });

    // ✅ Validate all inputs
    const validator = new Validator();
    validator.requireUUID(topic_id, "topic_id");
    validator.requireString(question, "question", 5, 1000);
    validator.requireString(option_a, "option_a", 1, 500);
    validator.requireString(option_b, "option_b", 1, 500);
    validator.requireString(option_c, "option_c", 1, 500);
    validator.requireString(option_d, "option_d", 1, 500);
    validator.requireOption(correct_option);
    validator.optionalString(explanation, "explanation", 2000);

    if (!validator.isValid()) {
      console.error("Validation failed:", validator.formatError());
      return badRequestResponse(validator.formatError());
    }

    // Verify topic exists
    const { data: topic } = await supabase
      .from("practice_topics")
      .select("id")
      .eq("id", topic_id)
      .maybeSingle();

    if (!topic) {
      return badRequestResponse("Topic not found");
    }

    const questionData = {
      topic_id,
      question: sanitizeString(question),
      option_a: sanitizeString(option_a),
      option_b: sanitizeString(option_b),
      option_c: sanitizeString(option_c),
      option_d: sanitizeString(option_d),
      correct_option,
      explanation: explanation ? sanitizeString(explanation) : null,
    };

    const { data, error } = await supabase
      .from("practice_questions")
      .insert([questionData])
      .select()
      .single();

    if (error) {
      console.error("Supabase Insert Error:", error);
      return serverErrorResponse(`Failed to create question: ${error.message}`);
    }

    console.log("✅ Question created successfully:", data.id);
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/practice-questions - Exception:", err);
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
    const { id, ...updateData } = body as UpdateQuestionRequest & { id: string };

    console.log("✏️ PUT /api/practice-questions - Updating question:", { id, userId });

    // ✅ Validate id
    const validator = new Validator();
    validator.requireUUID(id, "id");

    if (!validator.isValid()) {
      return badRequestResponse(validator.formatError());
    }

    // Validate any provided fields
    if (updateData.question)
      validator.requireString(updateData.question, "question", 5, 1000);
    if (updateData.option_a)
      validator.requireString(updateData.option_a, "option_a", 1, 500);
    if (updateData.option_b)
      validator.requireString(updateData.option_b, "option_b", 1, 500);
    if (updateData.option_c)
      validator.requireString(updateData.option_c, "option_c", 1, 500);
    if (updateData.option_d)
      validator.requireString(updateData.option_d, "option_d", 1, 500);
    if (updateData.correct_option)
      validator.requireOption(updateData.correct_option);
    if (updateData.explanation)
      validator.optionalString(updateData.explanation, "explanation", 2000);

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
    const sanitizedUpdate = {
      ...(updateData.question && { question: sanitizeString(updateData.question) }),
      ...(updateData.option_a && { option_a: sanitizeString(updateData.option_a) }),
      ...(updateData.option_b && { option_b: sanitizeString(updateData.option_b) }),
      ...(updateData.option_c && { option_c: sanitizeString(updateData.option_c) }),
      ...(updateData.option_d && { option_d: sanitizeString(updateData.option_d) }),
      ...(updateData.correct_option && { correct_option: updateData.correct_option }),
      ...(updateData.explanation !== undefined && {
        explanation: updateData.explanation ? sanitizeString(updateData.explanation) : null,
      }),
    };

    const { data, error } = await supabase
      .from("practice_questions")
      .update(sanitizedUpdate)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase Update Error:", error);
      return serverErrorResponse(`Failed to update question: ${error.message}`);
    }

    console.log("✅ Question updated successfully:", id);
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("PUT /api/practice-questions - Exception:", err);
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
    const { id } = body as DeleteQuestionRequest;

    console.log("🗑️ DELETE /api/practice-questions - Deleting question:", { id, userId });

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

    console.log("✅ Question deleted successfully:", id);
    return NextResponse.json({ success: true, message: "Question deleted" }, { status: 200 });
  } catch (err: any) {
    console.error("DELETE /api/practice-questions - Exception:", err);
    return serverErrorResponse(err.message || "Unknown error");
  }
}
