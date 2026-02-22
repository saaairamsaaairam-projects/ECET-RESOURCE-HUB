"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabase";
import { useToast } from "@/context/ToastContext";
import { Plus } from "lucide-react";

export default function AddTopicButton({ subject }: { subject: string }) {
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleAddTopic = async () => {
    const topicName = prompt("Enter topic name:");
    if (!topicName || !topicName.trim()) return;

    setLoading(true);

    try {
      console.log("📝 Creating topic:", { subject, topicName });

      // Get the current session and auth token
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error("❌ No active session:", sessionError);
        addToast("Error: You must be logged in to create topics", "error");
        return;
      }

      const token = session.access_token;
      console.log("✅ Session retrieved, token ready");

      const response = await fetch("/api/practice-topics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 🔐 Send auth token
        },
        body: JSON.stringify({ subject, name: topicName.trim() }),
      });

      const data = await response.json();
      console.log("📨 API Response Status:", response.status);
      console.log("📨 API Response Data:", data);

      if (!response.ok) {
        const errorMsg =
          data?.error || data?.message || JSON.stringify(data) || "Failed to create topic";
        console.error("❌ API Error:", errorMsg);
        addToast(`Error: ${errorMsg}`, "error");
        return;
      }

      console.log("✅ Topic created successfully:", data);
      addToast(`Topic "${topicName}" created successfully!`, "success");
      
      // Reload page to show new topic
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      console.error("❌ Network/Request Error:", error?.message);
      addToast(`Error: ${error?.message || "Failed to create topic"}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAddTopic}
      disabled={loading}
      className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white font-semibold rounded-lg transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Plus size={16} />
      {loading ? "Creating..." : "Add Topic"}
    </button>
  );
}
