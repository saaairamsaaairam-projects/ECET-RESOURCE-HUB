"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import toast from "react-hot-toast";

export default function PracticeTopicsAdmin() {
  const [subject, setSubject] = useState("");
  const [name, setName] = useState("");
  const [topics, setTopics] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSubject, setEditSubject] = useState("");

  async function fetchTopics() {
    const { data } = await supabase
      .from("practice_topics")
      .select("*")
      .order("created_at", { ascending: false });

    setTopics(data || []);
  }

  useEffect(() => {
    fetchTopics();
  }, []);

  function generateSlug(text: string) {
    return text.toLowerCase().replace(/\s+/g, "-");
  }

  async function createTopic() {
    if (!subject || !name) {
      toast.error("Subject and Topic name required");
      return;
    }

    const slug = generateSlug(name);

    const { error } = await supabase
      .from("practice_topics")
      .insert([{ subject, name, slug }]);

    if (error) {
      toast.error("Error creating topic");
    } else {
      toast.success("Topic created");
      setName("");
      fetchTopics();
    }
  }

  async function startEdit(topic: any) {
    setEditingId(topic.id);
    setEditName(topic.name);
    setEditSubject(topic.subject);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditSubject("");
  }

  async function saveEdit() {
    if (!editingId || !editName || !editSubject) {
      toast.error("Subject and name required");
      return;
    }

    const slug = generateSlug(editName);

    const { error } = await supabase
      .from("practice_topics")
      .update({ name: editName, subject: editSubject, slug })
      .eq("id", editingId);

    if (error) {
      toast.error("Error updating topic");
    } else {
      toast.success("Topic updated");
      cancelEdit();
      fetchTopics();
    }
  }

  async function deleteTopic(id: string) {
    await supabase
      .from("practice_topics")
      .delete()
      .eq("id", id);

    toast.success("Topic deleted");
    fetchTopics();
  }

  return (
    <div className="min-h-screen bg-[#0f0e17] text-white pt-24 px-6">

      <h1 className="text-3xl font-bold mb-6">Practice Topic Management</h1>

      {/* Create Section */}
      <div className="bg-[#151421] p-6 rounded-xl mb-10 space-y-4">

        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full p-3 rounded bg-white/10 border border-white/20"
        >
          <option value="">Select Subject</option>
          <option value="java">Java</option>
          <option value="dbms">DBMS</option>
          <option value="os">Operating Systems</option>
          <option value="python">Python</option>
        </select>

        <input
          placeholder="Topic Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 rounded bg-white/10 border border-white/20"
        />

        <button
          onClick={createTopic}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg"
        >
          Create Topic
        </button>
      </div>

      {/* Topic List */}
      <div className="bg-[#151421] p-6 rounded-xl">

        <h2 className="text-xl font-semibold mb-4">Existing Topics</h2>

        {topics.map((topic: any) => (
          <div
            key={topic.id}
            className="flex justify-between items-center py-2 border-b border-white/10"
          >
            <div>
              {editingId === topic.id ? (
                <div className="space-y-2">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="p-2 rounded bg-white/5"
                  />
                  <select
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="p-2 rounded bg-white/5"
                  >
                    <option value="java">Java</option>
                    <option value="dbms">DBMS</option>
                    <option value="os">Operating Systems</option>
                    <option value="python">Python</option>
                  </select>
                </div>
              ) : (
                <>
                  <p className="font-medium">{topic.name}</p>
                  <p className="text-sm text-gray-400">{topic.subject}</p>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {editingId === topic.id ? (
                <>
                  <button onClick={saveEdit} className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded">Save</button>
                  <button onClick={cancelEdit} className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded">Cancel</button>
                </>
              ) : (
                <>
                  <button onClick={() => startEdit(topic)} className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded">Edit</button>
                  <button
                    onClick={() => deleteTopic(topic.id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}
