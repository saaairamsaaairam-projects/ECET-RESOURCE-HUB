import { supabase } from "@/utils/supabase";
import Link from "next/link";
import { getUserRole } from "@/utils/getUserRole";

export default async function QuizListPage({ params }: any) {
  const { id: folderId } = params;

  const role = await getUserRole();

  const { data: quizzes, error } = await supabase
    .from("quizzes")
    .select("*")
    .eq("subject_folder_id", folderId)
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Quizzes</h1>

      {role === "admin" && (
        <div className="mb-5">
          <Link
            href={`/folder/${folderId}/quiz/create`}
            className="px-4 py-2 bg-purple-600 rounded text-white hover:bg-purple-700"
          >
            + Create New Quiz
          </Link>
        </div>
      )}

      {!quizzes || quizzes.length === 0 ? (
        <p>No quizzes available for this subject.</p>
      ) : (
        <div className="grid gap-4">
          {quizzes.map((quiz: any) => (
            <div
              key={quiz.id}
              className="p-4 bg-gray-900 rounded-lg border border-gray-700"
            >
              <h2 className="text-xl font-semibold">{quiz.title}</h2>

              <div className="mt-3 flex gap-4">
                <Link
                  href={`/quiz/${quiz.id}/start`}
                  className="text-blue-400 underline"
                >
                  Start Quiz
                </Link>

                {role === "admin" && (
                  <>
                    <Link
                      href={`/quiz/manage/${quiz.id}`}
                      className="text-yellow-400 underline"
                    >
                      Manage Questions
                    </Link>
                    <Link
                      href={`/api/quiz/delete?id=${quiz.id}`}
                      className="text-red-400 underline"
                    >
                      Delete
                    </Link>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
