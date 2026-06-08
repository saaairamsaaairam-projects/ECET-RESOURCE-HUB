"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { StandaloneTopic } from "@/types/database";

export default function TopicsPage() {
  const [topics, setTopics] = useState<StandaloneTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await fetch("/api/standalone-topics");
      if (response.ok) {
        const data = await response.json();
        setTopics(data);
      }
    } catch (error) {
      console.error("Failed to fetch topics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0e17] text-white flex items-center justify-center">
        <div className="text-xl">Loading topics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0e17] text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-purple-400 mb-4">Topics</h1>
          <p className="text-gray-300 text-lg">
            Explore comprehensive guides and explanations on various topics
          </p>
        </div>

        {topics.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-xl">No topics available yet.</p>
            <p className="text-gray-500 mt-2">Check back later for new content!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic) => (
              <Link
                key={topic.id}
                href={`/topics/${topic.slug}`}
                className="bg-[#1a1a2e] border border-gray-600 rounded-lg p-6 hover:border-purple-400 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20"
              >
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-purple-400 mb-2 line-clamp-2">
                    {topic.title}
                  </h2>
                  {topic.description && (
                    <p className="text-gray-300 text-sm line-clamp-3">
                      {topic.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>{new Date(topic.created_at).toLocaleDateString()}</span>
                  <span className="text-purple-400">Read more →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}