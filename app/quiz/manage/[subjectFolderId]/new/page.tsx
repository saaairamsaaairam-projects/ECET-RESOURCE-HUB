"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";

export default function NewQuizPage({ params }: any) {
  const { subjectFolderId } = params || {};
  const { isAdmin } = useAuth();
  const router = useRouter();

  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [topicId, setTopicId] = useState("");
  const [mode, setMode] = useState("practice");
  const [description, setDescription] = useState("");

  async function loadTopics() {
    setLoading(true);
    try {
      const res = await fetch(`/api/practice/topics?subjectFolderId=${subjectFolderId}`);
      const data = await res.json();
      setTopics(data || []);
    } catch (err) {
      console.error("Failed to load topics", err);
      setTopics([]);
    } finally {
      setLoading(false);
    }
  }

  async function createQuiz() {
    if (!name || !topicId) {
      alert("Please fill all fields.");
      return;
    }

    try {
      // Get session token for admin verification
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;

      const res = await fetch("/api/quiz/sets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          topic_id: topicId,
          subject_folder_id: subjectFolderId,
          mode,
          description,
        }),
      });

      // attempt to parse JSON, but fall back to text for better debugging
      let quiz: any = null;
      const status = res.status;
      try {
        const text = await res.text();
        try {
          quiz = text ? JSON.parse(text) : {};
        } catch (e) {
          quiz = { _raw: text };
        }
      } catch (e) {
        console.error("Failed to read response body", e);
      }

      if (!res.ok) {
        console.error("Create quiz failed", { status, body: quiz });
        alert((quiz && (quiz.error || quiz.message)) || "Failed to create quiz");
        return;
      }

      router.push(`/quiz/manage/questions/${quiz.id}`);
    } catch (err) {
      console.error("Create quiz error", err);
      alert("Network error");
    }
  }

  useEffect(() => {
    loadTopics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isAdmin) {
    return <div className="p-6 text-center text-red-400">Access Denied</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create New Quiz</h1>

      <div className="space-y-4">

        <div>
          <label className="block mb-1 text-gray-300">Quiz Name</label>
          <input
            type="text"
            className="w-full p-2 rounded bg-gray-800 border border-gray-600"
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-300">Select Topic</label>

          {loading ? (
            <p className="text-gray-400">Loading topics...</p>
          ) : (
            <select
              className="w-full p-2 rounded bg-gray-800 border border-gray-600"
              onChange={(e) => setTopicId(e.target.value)}
            >
              <option value="">-- choose topic --</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block mb-1 text-gray-300">Quiz Mode</label>
          <select
            className="w-full p-2 rounded bg-gray-800 border border-gray-600"
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="practice">Practice Mode</option>
            <option value="exam">Exam Mode</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 text-gray-300">Description</label>
          <textarea
            rows={3}
            className="w-full p-2 rounded bg-gray-800 border border-gray-600"
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button
          onClick={createQuiz}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Create Quiz
        </button>
      </div>
    </div>
  );
}
