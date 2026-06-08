"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { StandaloneTopic } from "@/types/database";
import StandaloneTopicEditor from "@/components/topics/StandaloneTopicEditor";

export default function EditTopicPage() {
  const params = useParams();
  const router = useRouter();
  const { isAdmin } = useAuth();
  const slug = params.slug as string;
  const [topic, setTopic] = useState<StandaloneTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin === false) {
      router.push("/login");
      return;
    }

    if (slug && isAdmin) {
      fetchTopic();
    }
  }, [slug, isAdmin, router]);

  const fetchTopic = async () => {
    try {
      // First get all topics (admin can see all) to find the one with matching slug
      const response = await fetch("/api/standalone-topics");
      if (!response.ok) throw new Error("Failed to fetch topics");

      const topics: StandaloneTopic[] = await response.json();
      const foundTopic = topics.find(t => t.slug === slug);

      if (!foundTopic) {
        setError("Topic not found");
        return;
      }

      setTopic(foundTopic);
    } catch (err) {
      console.error("Failed to fetch topic:", err);
      setError("Failed to load topic");
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0f0e17] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-400">Admin access required</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0e17] text-white flex items-center justify-center">
        <div className="text-xl">Loading topic...</div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="min-h-screen bg-[#0f0e17] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Topic Not Found</h1>
          <p className="text-gray-400">{error || "The requested topic could not be found."}</p>
        </div>
      </div>
    );
  }

  return <StandaloneTopicEditor topic={topic} />;
}