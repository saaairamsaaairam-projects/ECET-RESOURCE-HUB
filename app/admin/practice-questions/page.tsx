"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import toast from "react-hot-toast";
import { Plus, Trash2, Edit2, ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";

export default function PracticeQuestionsAdmin() {
  const [subjects] = useState(["java", "dbms", "os", "python"]);
  const [subject, setSubject] = useState("");
  const [topics, setTopics] = useState<any[]>([]);
  const [topicId, setTopicId] = useState("");

  // Topic management states
  const [newTopicName, setNewTopicName] = useState("");
  const [editingTopic, setEditingTopic] = useState<string | null>(null);
  const [editingTopicName, setEditingTopicName] = useState("");

  // Question management states
  const [page, setPage] = useState(1);
  const [per] = useState(10);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  const [question, setQuestion] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctOption, setCorrectOption] = useState("");
  const [explanation, setExplanation] = useState("");

  const [existingQuestions, setExistingQuestions] = useState<any[]>([]);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  // Fetch topics when subject changes
  useEffect(() => {
    if (subject) {
      fetchTopics();
      setTopicId("");
    }
  }, [subject]);

  // Fetch questions when topic changes
  useEffect(() => {
    if (topicId) {
      fetchQuestions(1);
      setPage(1);
    }
  }, [topicId]);

  async function fetchTopics() {
    try {
      const { data, error } = await supabase
        .from("practice_topics")
        .select("*")
        .eq("subject", subject)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTopics(data || []);
    } catch (error) {
      toast.error("Error fetching topics");
    }
  }

  async function fetchQuestions(p = 1) {
    try {
      const res = await fetch(`/api/practice-questions?topic_id=${topicId}&page=${p}&per=${per}`);
      const data = await res.json();
      setExistingQuestions(data || []);
    } catch (error) {
      toast.error("Error fetching questions");
    }
  }

  // Topic management functions
  async function createTopic() {
    if (!subject || !newTopicName.trim()) {
      toast.error("Subject and topic name are required");
      return;
    }

    const slug = newTopicName.toLowerCase().replace(/\s+/g, "-");

    try {
      const { error } = await supabase.from("practice_topics").insert([
        { subject, name: newTopicName, slug },
      ]);

      if (error) throw error;
      toast.success("Topic created successfully");
      setNewTopicName("");
      fetchTopics();
    } catch (error) {
      toast.error("Error creating topic");
    }
  }

  async function updateTopic(topicId: string) {
    if (!editingTopicName.trim()) {
      toast.error("Topic name cannot be empty");
      return;
    }

    const slug = editingTopicName.toLowerCase().replace(/\s+/g, "-");

    try {
      const { error } = await supabase
        .from("practice_topics")
        .update({ name: editingTopicName, slug })
        .eq("id", topicId);

      if (error) throw error;
      toast.success("Topic updated successfully");
      setEditingTopic(null);
      setEditingTopicName("");
      fetchTopics();
    } catch (error) {
      toast.error("Error updating topic");
    }
  }

  async function deleteTopic(topicId: string) {
    if (!window.confirm("Are you sure you want to delete this topic? This will also delete all associated questions.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("practice_topics")
        .delete()
        .eq("id", topicId);

      if (error) throw error;
      toast.success("Topic deleted successfully");
      if (topicId === topicId) {
        setTopicId("");
      }
      fetchTopics();
    } catch (error) {
      toast.error("Error deleting topic");
    }
  }

  // Question management functions
  async function addQuestion() {
    if (
      !topicId ||
      !question.trim() ||
      !optionA.trim() ||
      !optionB.trim() ||
      !optionC.trim() ||
      !optionD.trim() ||
      !correctOption
    ) {
      toast.error("All fields are required");
      return;
    }

    const payload = {
      topic_id: topicId,
      question,
      option_a: optionA,
      option_b: optionB,
      option_c: optionC,
      option_d: optionD,
      correct_option: correctOption,
      explanation,
    };

    try {
      if (editingQuestionId) {
        const res = await fetch(`/api/practice-questions/${editingQuestionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Update failed");
        toast.success("Question updated successfully");
        setEditingQuestionId(null);
      } else {
        const res = await fetch(`/api/practice-questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Create failed");
        toast.success("Question added successfully");
      }

      clearQuestionForm();
      fetchQuestions(page);
    } catch (error) {
      toast.error("Error saving question");
    }
  }

  function clearQuestionForm() {
    setQuestion("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectOption("");
    setExplanation("");
    setEditingQuestionId(null);
  }

  async function deleteQuestion(id: string) {
    if (!window.confirm("Are you sure you want to delete this question?")) {
      return;
    }

    try {
      const res = await fetch(`/api/practice-questions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Question deleted successfully");
      fetchQuestions(page);
    } catch (error) {
      toast.error("Error deleting question");
    }
  }

  function startEditQuestion(q: any) {
    setEditingQuestionId(q.id);
    setQuestion(q.question || "");
    setOptionA(q.option_a || "");
    setOptionB(q.option_b || "");
    setOptionC(q.option_c || "");
    setOptionD(q.option_d || "");
    setCorrectOption(q.correct_option || "");
    setExplanation(q.explanation || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-[#0f0e17] text-white pt-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-violet-400 text-transparent bg-clip-text">
            Practice Management
          </h1>
          <p className="text-gray-300">Manage practice topics and questions</p>
        </motion.div>

        {/* Subject Selection */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8"
        >
          <label className="block text-sm font-semibold mb-3">Select Subject</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 focus:outline-none transition"
          >
            <option value="">Choose a subject...</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s.toUpperCase()}
              </option>
            ))}
          </select>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Topics Management */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 sticky top-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Plus size={20} /> Topics
              </h2>

              {subject ? (
                <div>
                  {/* Create New Topic */}
                  <div className="space-y-3 mb-6">
                    <input
                      type="text"
                      placeholder="New topic name..."
                      value={newTopicName}
                      onChange={(e) => setNewTopicName(e.target.value)}
                      className="w-full p-2 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 focus:outline-none transition text-sm"
                    />
                    <button
                      onClick={createTopic}
                      className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                    >
                      <Plus size={16} /> Create Topic
                    </button>
                  </div>

                  {/* Topics List */}
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Topics ({topics.length})</p>
                    {topics.length > 0 ? (
                      topics.map((topic) => (
                        <div
                          key={topic.id}
                          className={`p-3 rounded-lg transition cursor-pointer border ${
                            topicId === topic.id
                              ? "bg-purple-600/30 border-purple-500"
                              : "bg-white/5 border-white/10 hover:bg-white/10"
                          }`}
                        >
                          <div
                            onClick={() => setTopicId(topic.id)}
                            className="font-medium text-sm mb-2"
                          >
                            {topic.name}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingTopic(topic.id);
                                setEditingTopicName(topic.name);
                              }}
                              className="flex-1 px-2 py-1 bg-blue-600/30 hover:bg-blue-600/50 text-xs rounded transition flex items-center justify-center gap-1"
                            >
                              <Edit2 size={12} /> Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTopic(topic.id);
                              }}
                              className="flex-1 px-2 py-1 bg-red-600/30 hover:bg-red-600/50 text-xs rounded transition flex items-center justify-center gap-1"
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 py-4 text-center">No topics yet</p>
                    )}
                  </div>

                  {/* Edit Topic Modal */}
                  {editingTopic && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                      <div className="bg-[#151421] border border-white/10 rounded-xl p-6 w-full max-w-sm">
                        <h3 className="text-xl font-bold mb-4">Edit Topic</h3>
                        <input
                          type="text"
                          value={editingTopicName}
                          onChange={(e) => setEditingTopicName(e.target.value)}
                          className="w-full p-2 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 focus:outline-none transition mb-4"
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={() => updateTopic(editingTopic)}
                            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingTopic(null);
                              setEditingTopicName("");
                            }}
                            className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-400 text-sm text-center py-6">Select a subject to manage topics</p>
              )}
            </div>
          </motion.div>

          {/* Questions Management */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            {topicId ? (
              <div className="space-y-6">
                {/* Add/Edit Question Form */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h2 className="text-2xl font-bold mb-6">
                    {editingQuestionId ? "Edit Question" : "Add New Question"}
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">Question</label>
                      <textarea
                        placeholder="Enter the question..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 focus:outline-none transition"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-300 mb-2 block">Option A</label>
                        <input
                          placeholder="Option A"
                          value={optionA}
                          onChange={(e) => setOptionA(e.target.value)}
                          className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 focus:outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-gray-300 mb-2 block">Option B</label>
                        <input
                          placeholder="Option B"
                          value={optionB}
                          onChange={(e) => setOptionB(e.target.value)}
                          className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 focus:outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-gray-300 mb-2 block">Option C</label>
                        <input
                          placeholder="Option C"
                          value={optionC}
                          onChange={(e) => setOptionC(e.target.value)}
                          className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 focus:outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-gray-300 mb-2 block">Option D</label>
                        <input
                          placeholder="Option D"
                          value={optionD}
                          onChange={(e) => setOptionD(e.target.value)}
                          className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 focus:outline-none transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">Correct Option</label>
                      <select
                        value={correctOption}
                        onChange={(e) => setCorrectOption(e.target.value)}
                        className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 focus:outline-none transition"
                      >
                        <option value="">Select correct answer...</option>
                        <option value="a">Option A</option>
                        <option value="b">Option B</option>
                        <option value="c">Option C</option>
                        <option value="d">Option D</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">Explanation (Optional)</label>
                      <textarea
                        placeholder="Provide explanation for the answer..."
                        value={explanation}
                        onChange={(e) => setExplanation(e.target.value)}
                        className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 focus:outline-none transition"
                        rows={2}
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={addQuestion}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg font-semibold transition"
                      >
                        {editingQuestionId ? "Update Question" : "Add Question"}
                      </button>
                      {editingQuestionId && (
                        <button
                          onClick={clearQuestionForm}
                          className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Questions List */}
                {existingQuestions.length > 0 && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h2 className="text-2xl font-bold mb-6">
                      Questions ({existingQuestions.length})
                    </h2>

                    <div className="space-y-4">
                      {existingQuestions.map((q, idx) => (
                        <motion.div
                          key={q.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-4 border border-white/10 rounded-lg hover:bg-white/5 transition"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-semibold text-sm text-purple-300">
                                Q{(page - 1) * per + idx + 1}
                              </p>
                              <p className="text-base mt-1">{q.question}</p>
                            </div>
                            <span className="text-xs bg-green-600/20 text-green-300 px-2 py-1 rounded">
                              {q.correct_option?.toUpperCase()}
                            </span>
                          </div>

                          <div className="text-xs text-gray-400 mb-3 space-y-1">
                            <p>A. {q.option_a}</p>
                            <p>B. {q.option_b}</p>
                            <p>C. {q.option_c}</p>
                            <p>D. {q.option_d}</p>
                          </div>

                          {q.explanation && (
                            <p className="text-xs text-gray-300 mb-3">
                              <span className="font-semibold">Explanation:</span> {q.explanation}
                            </p>
                          )}

                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => startEditQuestion(q)}
                              className="px-3 py-1 bg-blue-600/30 hover:bg-blue-600/50 text-xs rounded transition flex items-center gap-1"
                            >
                              <Edit2 size={14} /> Edit
                            </button>
                            <button
                              onClick={() => deleteQuestion(q.id)}
                              className="px-3 py-1 bg-red-600/30 hover:bg-red-600/50 text-xs rounded transition flex items-center gap-1"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center mt-6 pt-6 border-t border-white/10">
                      <button
                        onClick={() => {
                          setPage((p) => Math.max(1, p - 1));
                          fetchQuestions(Math.max(1, page - 1));
                        }}
                        disabled={page === 1}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 rounded-lg transition"
                      >
                        ← Previous
                      </button>

                      <div className="text-sm text-gray-300">Page {page}</div>

                      <button
                        onClick={() => {
                          setPage((p) => p + 1);
                          fetchQuestions(page + 1);
                        }}
                        disabled={existingQuestions.length < per}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg transition"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
                <p className="text-gray-400">Select a topic to manage questions</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
