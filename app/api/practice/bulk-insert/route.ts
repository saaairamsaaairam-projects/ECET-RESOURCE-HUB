import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
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
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore errors when called from API route
            }
          },
        },
      }
    );
    const body = await req.json();

    const { topicId, questions } = body;

    if (!topicId || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const normalizeAnswer = (val: any) => {
      if (val == null) return null;
      const s = String(val).trim();
      if (!s) return null;
      const up = s.toUpperCase();
      // Accept formats: 'A', 'a', '1', 'option_a', 'OPTION_A', 'A)', 'A.'
      if (/^[ABCD]$/.test(up)) return up;
      if (/^[1234]$/.test(up)) return ("ABCD"[Number(up) - 1]) || null;
      if (up.startsWith("OPTION_")) {
        const last = up.slice(7);
        if (/^[ABCD]$/.test(last)) return last;
      }
      const m = up.match(/^([ABCD])[).\s]*$/);
      if (m) return m[1];
      return null;
    };

    const formatted = questions.map((q: any) => ({
      topic_id: topicId,
      question: q.question,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_option: normalizeAnswer(q.correct_answer || q.correct_option || q.correct),
      explanation: q.explanation || null,
    }));

    const { error } = await supabase.from("practice_questions").insert(formatted);

    if (error) {
      console.error("Bulk insert error:", error);
      return NextResponse.json({ error: error.message || error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("/api/practice/bulk-insert error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
