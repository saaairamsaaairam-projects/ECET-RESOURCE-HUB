"use client";

import Image from "next/image";
import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface CollegeLightboxProps {
  images: string[];
  openIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function CollegeLightbox({ images, openIndex, isOpen, onClose, onPrev, onNext }: CollegeLightboxProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onNext();
      if (event.key === "ArrowLeft") onPrev();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose, onNext, onPrev]);

  if (!isOpen || !images.length) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={onClose}>
      <div className="relative w-full max-w-6xl rounded-3xl border border-white/10 bg-black/80 p-3 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={onClose} className="absolute right-3 top-3 z-10 rounded-full border border-white/10 bg-black/60 p-2 text-white">
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center justify-between gap-3 px-2 pb-3 text-sm text-gray-200">
          <span>{openIndex + 1} / {images.length}</span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onPrev} className="rounded-full border border-white/10 bg-white/5 p-2 text-white"> <ChevronLeft className="h-4 w-4" /> </button>
            <button type="button" onClick={onNext} className="rounded-full border border-white/10 bg-white/5 p-2 text-white"> <ChevronRight className="h-4 w-4" /> </button>
          </div>
        </div>

        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 bg-black/40">
          <Image src={images[openIndex]} alt="Expanded college gallery" fill sizes="(max-width: 1024px) 100vw, 80vw" className="object-contain" priority />
        </div>
      </div>
    </div>
  );
}
