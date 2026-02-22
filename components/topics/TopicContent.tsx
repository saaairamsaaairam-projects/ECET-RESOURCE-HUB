"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Image from "@tiptap/extension-image";
import { createLowlight, all } from "lowlight";
import { supabase } from "@/utils/supabase";

const lowlight = createLowlight(all);
import { uploadTopicImage } from "@/utils/uploadTopicImage";

export default function TopicContent({
  folderId,
  topic,
  initialContent,
}: {
  folderId: string;
  topic: any;
  initialContent: string;
}) {
  const { isAdmin } = useAuth();
  const [saving, setSaving] = useState(false);

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

  // Debug: log editor state
  if (typeof window !== "undefined" && editor) {
    console.log("Editor initialized. Editable:", editor.isEditable, "isAdmin:", isAdmin);
  }

  async function saveContent() {
    if (!editor) {
      console.warn("Editor not ready");
      return;
    }
    setSaving(true);

    try {
      const htmlContent = editor.getHTML();
      console.log("Saving content, length:", htmlContent.length);

      const { data, error } = await supabase
        .from("practice_topic_content")
        .upsert(
          {
            topic_id: topic.id,
            content: htmlContent,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "topic_id" }
        )
        .select();

      if (error) {
        console.error("Supabase error details:", error.message, error.code, error.details);
        throw new Error(`${error.message} (${error.code})`);
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

  return (
    <div className="text-white w-full">
      <h1 className="text-3xl font-bold mb-6 text-purple-400">{topic.name}</h1>

      {isAdmin && (
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
            {saving ? "Saving…" : "💾 Save"}
          </button>
        </div>
      )}

      <div className="bg-[#1a1a1a] border border-gray-600 rounded-lg p-6 min-h-[500px] shadow-lg">
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

      {isAdmin && (
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
      )}
    </div>
  );
}
