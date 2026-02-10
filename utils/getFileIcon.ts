export function getFileTypeInfo(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase();

  if (!ext) return { type: "unknown", icon: "/file-icons/file.png" };

  const mapping: Record<string, { type: string; icon: string }> = {
    pdf: { type: "pdf", icon: "/file-icons/pdf.png" },
    png: { type: "image", icon: "/file-icons/image.png" },
    jpg: { type: "image", icon: "/file-icons/image.png" },
    jpeg: { type: "image", icon: "/file-icons/image.png" },
    webp: { type: "image", icon: "/file-icons/image.png" },
    gif: { type: "image", icon: "/file-icons/image.png" },
    svg: { type: "image", icon: "/file-icons/image.png" },
    ppt: { type: "ppt", icon: "/file-icons/ppt.png" },
    pptx: { type: "ppt", icon: "/file-icons/ppt.png" },
    doc: { type: "doc", icon: "/file-icons/word.png" },
    docx: { type: "doc", icon: "/file-icons/word.png" },
    txt: { type: "text", icon: "/file-icons/text.png" },
    zip: { type: "zip", icon: "/file-icons/zip.jpg" },
    rar: { type: "zip", icon: "/file-icons/zip.jpg" },
    mp4: { type: "video", icon: "/file-icons/video.svg" },
    mov: { type: "video", icon: "/file-icons/video.svg" },
    mkv: { type: "video", icon: "/file-icons/video.svg" },
  };

  return mapping[ext] || { type: "unknown", icon: "/file-icons/file.png" };
}

// backward compatible helper
export function getFileIcon(filename: string) {
  return getFileTypeInfo(filename).icon;
}
