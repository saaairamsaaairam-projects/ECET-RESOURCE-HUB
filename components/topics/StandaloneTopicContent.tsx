"use client";

import { useState, useEffect } from "react";
import { StandaloneTopic } from "@/types/database";

export default function StandaloneTopicContent({ topic }: { topic: StandaloneTopic }) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, [topic.id]);

  const fetchContent = async () => {
    try {
      const response = await fetch(`/api/standalone-topics/content?topicId=${topic.id}`);
      if (response.ok) {
        const data = await response.json();
        setContent(data.content || "");
      }
    } catch (error) {
      console.error("Failed to fetch content:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0e17] text-white flex items-center justify-center">
        <div className="text-xl">Loading content...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0e17] text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-purple-400 mb-4">{topic.title}</h1>
          {topic.description && (
            <p className="text-gray-300 text-lg mb-6">{topic.description}</p>
          )}
          <div className="text-sm text-gray-400">
            Published: {new Date(topic.created_at).toLocaleDateString()}
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-gray-600 rounded-lg p-8 shadow-lg">
          {content ? (
            <div
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No content available yet.</p>
              <p className="text-gray-500 mt-2">This topic is being prepared for publication.</p>
            </div>
          )}
        </div>

        <style jsx global>{`
          .prose {
            color: #e5e7eb;
            line-height: 1.6;
          }

          .prose p {
            margin-bottom: 1rem;
          }

          .prose h1 {
            font-size: 2.25em;
            font-weight: bold;
            margin: 1em 0 0.5em 0;
            color: #a855f7;
          }

          .prose h2 {
            font-size: 1.875em;
            font-weight: bold;
            margin: 1.5em 0 0.75em 0;
            color: #a855f7;
          }

          .prose h3 {
            font-size: 1.5em;
            font-weight: bold;
            margin: 1.25em 0 0.5em 0;
            color: #a855f7;
          }

          .prose ul,
          .prose ol {
            margin-left: 2rem;
            margin-bottom: 1rem;
          }

          .prose li {
            margin-bottom: 0.25rem;
          }

          .prose code {
            background-color: #374151;
            color: #a3e635;
            padding: 0.2em 0.4em;
            border-radius: 0.25rem;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 0.9em;
          }

          .prose pre {
            background-color: #111827;
            color: #d1d5db;
            padding: 1rem;
            border-radius: 0.5rem;
            border: 1px solid #374151;
            margin: 1rem 0;
            overflow-x: auto;
          }

          .prose pre code {
            background-color: transparent;
            color: inherit;
            padding: 0;
            font-size: 0.9em;
          }

          .prose blockquote {
            border-left: 4px solid #7c3aed;
            padding-left: 1rem;
            margin-left: 0;
            color: #d1d5db;
            font-style: italic;
          }

          .prose img {
            max-width: 100%;
            height: auto;
            border-radius: 0.5rem;
            margin: 1rem 0;
          }

          .prose a {
            color: #60a5fa;
            text-decoration: none;
          }

          .prose a:hover {
            text-decoration: underline;
          }

          .prose strong {
            font-weight: bold;
            color: #f3f4f6;
          }

          .prose em {
            font-style: italic;
          }
        `}</style>
      </div>
    </div>
  );
}