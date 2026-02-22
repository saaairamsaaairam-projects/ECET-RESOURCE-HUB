import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getAdminClient, verifyAdminFromToken, badRequestResponse, forbiddenResponse, serverErrorResponse } from "@/utils/serverAuth";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Verify admin via Authorization header
    const adminId = await verifyAdminFromToken(req as any);
    if (!adminId) return forbiddenResponse();

    const form = await req.formData();
    const file = form.get("file") as File | null;
    const topicId = String(form.get("topicId") || "");

    if (!file || !topicId) return badRequestResponse("Missing file or topicId");

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<any>(sheet, { defval: null });

    if (!Array.isArray(rows) || rows.length === 0) {
      return badRequestResponse("No rows found in uploaded file");
    }

    const normalizeAnswer = (val: any) => {
      if (val == null) return null;
      const s = String(val).trim();
      if (!s) return null;
      const up = s.toUpperCase();
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

    const questions = rows.map((row: any) => {
      // support multiple header variants
      const q = String(row.Question || row.question || row.Q || row.q || "");
      const a = String(row.A || row.a || row.option_a || "");
      const b = String(row.B || row.b || row.option_b || "");
      const c = String(row.C || row.c || row.option_c || "");
      const d = String(row.D || row.d || row.option_d || "");
      const rawCorrect = row.Answer || row.answer || row.Correct || row.correct || row.correct_answer || row.correctOption || row.correct_option || null;

      return {
        topic_id: topicId,
        question: q,
        option_a: a,
        option_b: b,
        option_c: c,
        option_d: d,
        correct_option: normalizeAnswer(rawCorrect) || "A",
        explanation: String(row.Explanation || row.explanation || "") || null,
      };
    });

    const supabase = getAdminClient();
    const { error } = await supabase.from("practice_questions").insert(questions);
    if (error) {
      console.error("Bulk upload insert error:", error);
      return serverErrorResponse(error.message || "DB insert error");
    }

    return NextResponse.json({ success: true, inserted: questions.length });
  } catch (err) {
    console.error("/api/practice/bulk-upload error:", err);
    return serverErrorResponse("Server error");
  }
}
