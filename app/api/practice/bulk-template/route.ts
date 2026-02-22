import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET() {
  // Template rows
  const rows = [
    {
      Question: "Which keyword is used to inherit a class in Java?",
      A: "extends",
      B: "implements",
      C: "inherit",
      D: "super",
      Answer: "A",
      Explanation: "extends is used for inheritance.",
    },
    {
      Question: "Which method is the entry point of a Java program?",
      A: "main()",
      B: "start()",
      C: "run()",
      D: "execute()",
      Answer: "A",
      Explanation: "main() is the entry point for Java programs.",
    },
  ];

  // Create workbook
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "MCQs");

  // Generate buffer
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Disposition": `attachment; filename="mcq_template.xlsx"`,
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });
}
