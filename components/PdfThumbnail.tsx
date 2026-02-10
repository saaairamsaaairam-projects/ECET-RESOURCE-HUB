"use client";

import { useEffect, useState } from "react";

export default function PdfThumbnail({ url }: { url: string }) {
  const [thumb, setThumb] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        
        const pdf = await pdfjsLib.getDocument(url).promise;
        const page = await pdf.getPage(1);

        const scale = 1;
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderTask = page.render({
          canvasContext: context,
          viewport: viewport,
        } as any);

        await renderTask.promise;

        if (!cancelled) setThumb(canvas.toDataURL());
      } catch (err) {
        console.error("PDF thumbnail error:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <>
      {thumb ? (
        <img src={thumb} alt="PDF preview" className="w-full h-32 object-cover rounded-lg mb-3" />
      ) : (
        <div className="w-full h-32 bg-white/5 animate-pulse rounded-lg" />
      )}
    </>
  );
}
