"use client";

import { useState } from "react";
import EditMCQModal from "./EditMCQModal";

export default function EditMCQButton({
  question,
  topicId,
  folderId,
  topicSlug,
  onReload,
}: {
  question: any;
  topicId: string;
  folderId: string;
  topicSlug: string;
  onReload?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
        title="Edit question"
      >
        ✏️
      </button>

      <EditMCQModal
        open={open}
        setOpen={setOpen}
        question={question}
        topicId={topicId}
        folderId={folderId}
        topicSlug={topicSlug}
        onReload={onReload}
      />
    </>
  );
}
