import { supabase } from "@/utils/supabase";

export default async function QuizPage({ params }: any) {
  const { quizId } = await params;
  const { data: quiz, error } = await supabase
    .from("quiz_sets")
    .select("*")
    .eq("id", quizId)
    .single();

  if (error || !quiz) return <div className="p-6">Quiz not found.</div>;

  const title = quiz.title || quiz.name;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold">{title}</h1>

      <p className="text-gray-400 mt-2">{quiz.description}</p>

      <div className="mt-6 space-y-3 text-lg">
        <p><strong>Total Questions:</strong> {quiz.total_questions}</p>
        <p><strong>Duration:</strong> {(quiz.duration_minutes || quiz.duration || 60)} minutes</p>
      </div>

      <a
        href={`/quiz/${quizId}/start`}
        className="inline-block mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg"
      >
        Start Quiz →
      </a>
    </div>
  );
}
