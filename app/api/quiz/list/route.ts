import { NextResponse } from "next/server";
import { getAdminClient } from "@/utils/serverAuth";

export async function GET() {
  try {
    const client = getAdminClient();

    // quiz_sets is the actual table (created in migrations)
    const { data: sets, error } = await client
      .from("quiz_sets")
      .select("*, subject:subject_folder_id(id)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("GET /api/quiz/list error", error);
      // Include error details in development to aid debugging
      const payload: any = { error: "Failed to load quizzes" };
      if (process.env.NODE_ENV !== "production") {
        payload.details = error?.message || error;
      }
      return NextResponse.json(payload, { status: 500 });
    }

    // Map to the shape the frontend expects (title, description, id, mode, total_questions)
    const quizzes = (sets || []).map((s: any) => ({
      id: s.id,
      title: s.name || s.title,
      name: s.name,
      description: s.description,
      mode: s.mode,
      total_questions: s.total_questions,
      duration: s.duration_minutes || s.duration,
    }));

    // Log server-side diagnostics
    console.log("GET /api/quiz/list called", {
      NODE_ENV: process.env.NODE_ENV,
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      count: (quizzes || []).length,
    });

    // Return debug envelope so client can inspect what's happening
    const debug = {
      NODE_ENV: process.env.NODE_ENV,
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      count: (quizzes || []).length,
    };

    return NextResponse.json({ quizzes, debug });
  } catch (err) {
    console.error("GET /api/quiz/list exception", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
