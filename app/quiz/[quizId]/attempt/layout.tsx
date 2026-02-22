import "@/app/globals.css";
import ExamHeader from "@/components/quiz/ExamHeader";
import QuestionPalette from "@/components/quiz/QuestionPalette";

export default async function QuizAttemptLayout({ children, params }: any) {
  const { quizId } = await params;

  return (
    <div className="w-full h-screen flex overflow-hidden bg-gray-50">
      {/* LEFT SIDEBAR - PALETTE */}
      <aside className="w-64 bg-white border-r overflow-y-auto p-4">
        {/* @ts-ignore Server Component can render client component wrapper */}
        <QuestionPalette quizId={quizId} />
      </aside>

      {/* RIGHT EXAM AREA */}
      <main className="flex-1 flex flex-col">
        {/* Exam Header */}
        {/* @ts-ignore */}
        <ExamHeader quizId={quizId} />

        {/* Main Content (Question Block) */}
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
      </main>
    </div>
  );
}
