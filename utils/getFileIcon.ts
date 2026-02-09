export function getFileIcon(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "pdf":
      return "/file-icons/pdf.png";
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      return "/file-icons/image.png";
    case "doc":
    case "docx":
      return "/file-icons/word.png";
    case "ppt":
    case "pptx":
      return "/file-icons/ppt.png";
    case "txt":
      return "/file-icons/text.png";
    default:
      return "/file-icons/file.png";
  }
}
