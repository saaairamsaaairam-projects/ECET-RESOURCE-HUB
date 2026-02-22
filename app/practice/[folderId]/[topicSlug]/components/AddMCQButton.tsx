"use client";

import { useState } from "react";
import AddMCQModal from "./AddMCQModal";

export default function AddMCQButton({
  topicId,
  topicSlug,
  folderId,
  onReload,
}: {
  topicId: string;
  topicSlug: string;
  folderId: string;
  onReload?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mb-8">
        <button
          onClick={() => setOpen(true)}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors shadow-lg flex items-center gap-2"
        >
          <span>+</span> Add Question
        </button>
      </div>

      <AddMCQModal
        open={open}
        setOpen={setOpen}
        topicId={topicId}
        topicSlug={topicSlug}
        folderId={folderId}
        onReload={onReload}
      />
    </>
  );
}
