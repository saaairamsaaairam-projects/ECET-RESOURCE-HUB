"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Image from "@tiptap/extension-image";
import { createLowlight, all } from "lowlight";
import { StandaloneTopic } from "@/types/database";
import { uploadTopicImage } from "@/utils/uploadTopicImage";
import Link from "next/link";

const lowlight = createLowlight(all);

export default function StandaloneTopicEditor({ topic }: { topic: StandaloneTopic }) {
  const { isAdmin } = useAuth();
  const [saving, setSaving] = useState(false);
  const [initialContent, setInitialContent] = useState<string>("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing topic explanation…",
      }),
      CodeBlockLowlight.configure({ lowlight }),
      Image.configure({ inline: false }),
    ],
    content: initialContent,
    editable: !!isAdmin,
    immediatelyRender: false,
  });

  useEffect(() => {
    fetchContent();
  }, [topic.id]);

  const fetchContent = async () => {
    try {
      const response = await fetch(`/api/standalone-topics/content?topicId=${topic.id}`);
      if (response.ok) {
        const data = await response.json();
        const content = data.content || "";
        setInitialContent(content);
        editor?.commands.setContent(content);
      }
    } catch (error) {
      console.error("Failed to fetch content:", error);
    }
  };

  async function saveContent() {
    if (!editor) {
      console.warn("Editor not ready");
      return;
    }
    setSaving(true);

    try {
      const htmlContent = editor.getHTML();
      console.log("Saving content, length:", htmlContent.length);

      const response = await fetch("/api/standalone-topics/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId: topic.id,
          content: htmlContent,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save content");
      }

      console.log("Content saved successfully");
      alert("✅ Content saved!");
    } catch (error: any) {
      console.error("Error saving content:", error?.message || error?.toString() || error);
      alert(`Failed to save: ${error?.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  }

  async function addImage() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        const url = await uploadTopicImage(file, topic.id);
        editor?.chain().focus().setImage({ src: url }).run();
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("Failed to upload image. Check browser console for details.");
      }
    };
  }

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

  return (
    <div className="min-h-screen bg-[#0f0e17] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-purple-400 mb-2">Edit: {topic.title}</h1>
            <p className="text-gray-400">Editing standalone topic content</p>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/topics/${topic.slug}`}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              View Topic
            </Link>
            <Link
              href="/admin/standalone-topics"
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
            >
              Back to Admin
            </Link>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={addImage}
            className="px-4 py-2 bg-blue-700 rounded hover:bg-blue-800 transition-colors font-medium"
          >
            📸 Add Image
          </button>

          <button
            onClick={saveContent}
            disabled={saving}
            className="px-4 py-2 bg-purple-700 rounded hover:bg-purple-800 disabled:opacity-50 transition-colors font-medium"
          >
            {saving ? "Saving…" : "💾 Save Content"}
          </button>
        </div>

        <div className="bg-[#1a1a1a] border border-gray-600 rounded-lg p-6 min-h-[600px] shadow-lg">
          <style>{`
            .tiptap {
              outline: none;
              color: #e5e7eb;
              caret-color: #60a5fa;
              line-height: 1.6;
            }

            .tiptap p {
              margin-bottom: 0.5rem;
            }

            .tiptap h1 {
              font-size: 2em;
              font-weight: bold;
              margin: 0.67em 0;
            }

            .tiptap h2 {
              font-size: 1.5em;
              font-weight: bold;
              margin: 0.75em 0;
            }

            .tiptap h3 {
              font-size: 1.17em;
              font-weight: bold;
              margin: 0.83em 0;
            }

            .tiptap ul,
            .tiptap ol {
              margin-left: 2rem;
              margin-bottom: 0.5rem;
            }

            .tiptap li {
              margin-bottom: 0.25rem;
            }

            .tiptap code {
              background-color: #374151;
              color: #a3e635;
              padding: 0.2em 0.4em;
              border-radius: 0.25rem;
              font-family: 'Monaco', 'Courier New', monospace;
              font-size: 0.9em;
            }

            .tiptap pre {
              background-color: #111827;
              color: #d1d5db;
              padding: 1rem;
              border-radius: 0.5rem;
              border: 1px solid #374151;
              margin: 1rem 0;
              overflow-x: auto;
            }

            .tiptap pre code {
              background-color: transparent;
              color: inherit;
              padding: 0;
              font-size: 0.9em;
            }

            .tiptap blockquote {
              border-left: 4px solid #7c3aed;
              padding-left: 1rem;
              margin-left: 0;
              color: #d1d5db;
              font-style: italic;
            }

            .tiptap img {
              max-width: 100%;
              height: auto;
              border-radius: 0.5rem;
              margin: 1rem 0;
            }

            .tiptap a {
              color: #60a5fa;
              text-decoration: none;
              cursor: pointer;
            }

            .tiptap a:hover {
              text-decoration: underline;
            }

            .tiptap strong {
              font-weight: bold;
              color: #f3f4f6;
            }

            .tiptap em {
              font-style: italic;
            }
          `}</style>
          <EditorContent editor={editor} />
        </div>

        <div className="mt-4 text-sm text-gray-400">
          <details>
            <summary className="cursor-pointer hover:text-gray-300">ℹ️ Editor Formatting Tips</summary>
            <ul className="mt-2 ml-4 space-y-1">
              <li>• <strong>Bold:</strong> Ctrl+B | <strong>Italic:</strong> Ctrl+I</li>
              <li>• <strong>Headings:</strong> # Heading 1, ## Heading 2, etc.</li>
              <li>• <strong>Code block:</strong> Use triple backticks ```code```</li>
              <li>• <strong>Lists:</strong> - item or 1. item</li>
              <li>• <strong>Images:</strong> Click "Add Image" button above</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
}