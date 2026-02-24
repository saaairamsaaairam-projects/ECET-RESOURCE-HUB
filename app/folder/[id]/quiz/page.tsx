"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/context/AuthContext";

export default function QuizListPageClient() {
  const params = useParams();
  const folderId = params?.id as string | undefined;
  const { isAdmin } = useAuth();

  const [quizzes, setQuizzes] = useState<any[] | null>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
        if (!folderId || !uuidRegex.test(String(folderId))) {
          throw new Error(`Invalid folder id: ${String(folderId)}`);
        }

        const { data, error: err } = await supabase
          .from("quizzes")
          .select("*")
          .eq("subject_folder_id", folderId)
          .order("created_at", { ascending: false });

        setQuizzes(data || []);
        setError(err || null);
      } catch (e) {
        setError(e as any);
        setQuizzes([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [folderId]);

  if (loading) return <div className="p-6 max-w-3xl mx-auto">Loading quizzes...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Quizzes</h1>

      {isAdmin && (
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
        <>
          <p>No quizzes available for this subject.</p>
          {error && (
            <div className="mt-4 text-sm text-red-400">
              <strong>DB error:</strong> {String((error as any).message || error)}
            </div>
          )}
          <div className="mt-4 text-sm text-gray-400">
            <strong>Debug:</strong> folderId: {String(folderId)} | raw quizzes: {JSON.stringify(quizzes || [])}
          </div>
        </>
      ) : (
        <div className="grid gap-4">
          {quizzes.map((quiz: any) => (
            <div key={quiz.id} className="p-4 bg-gray-900 rounded-lg border border-gray-700">
              <h2 className="text-xl font-semibold">{quiz.title}</h2>

              <div className="mt-3 flex gap-4">
                <Link href={`/quiz/${quiz.id}/start`} className="text-blue-400 underline">
                  Start Quiz
                </Link>

                {isAdmin && (
                  <>
                    <Link href={`/quiz/manage/${quiz.id}`} className="text-yellow-400 underline">
                      Manage Questions
                    </Link>
                    <Link href={`/api/quiz/delete?id=${quiz.id}`} className="text-red-400 underline">
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
