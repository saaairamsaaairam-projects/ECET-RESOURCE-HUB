"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { deleteCollegeImage, uploadCollegeImage } from "@/lib/colleges/imageService";

interface GalleryImageManagerProps {
  collegeId?: string;
  images: string[];
  onChange: (images: string[]) => void;
}

export default function GalleryImageManager({ collegeId, images, onChange }: GalleryImageManagerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    setUploading(true);
    setError("");
    try {
      const uploaded = await Promise.all(files.map((file) => uploadCollegeImage(file)));
      onChange([...images, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to upload gallery images.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleDelete = async (imageUrl: string) => {
    setUploading(true);
    setError("");
    try {
      await deleteCollegeImage(imageUrl, collegeId);
      onChange(images.filter((item) => item !== imageUrl));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete image.");
    } finally {
      setUploading(false);
    }
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-black/10 p-4">
      <div>
        <h3 className="text-xl font-semibold text-white">Gallery Images</h3>
        <p className="text-sm text-gray-300">Upload multiple photos, keep the best ones first, and remove any outdated visuals instantly.</p>
      </div>

      <div className="rounded-2xl border border-dashed border-purple-400/30 bg-purple-500/5 p-4">
        <button type="button" onClick={() => inputRef.current?.click()} className="rounded-xl border border-purple-400/40 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-100">Add Images</button>
        <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" />
      </div>

      {uploading ? <p className="text-sm text-gray-300">Uploading images…</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {images.length === 0 ? (
          <p className="text-sm text-gray-300">No gallery images yet. Add a few photos to make the college profile more engaging.</p>
        ) : (
          images.map((imageUrl, index) => (
            <article key={imageUrl} className="group overflow-hidden rounded-2xl border border-white/10 bg-black/20">
              <Image src={imageUrl} alt={`Gallery ${index + 1}`} width={500} height={320} className="h-32 w-full object-cover" />
              <div className="flex items-center justify-between gap-2 p-3">
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => moveImage(index, -1)} disabled={index === 0} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-gray-100 disabled:opacity-40">↑</button>
                  <button type="button" onClick={() => moveImage(index, 1)} disabled={index === images.length - 1} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-gray-100 disabled:opacity-40">↓</button>
                </div>
                <button type="button" onClick={() => handleDelete(imageUrl)} className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-1 text-xs text-rose-100">Delete</button>
              </div>
            </article>
          ))
        )}
      </div>

      {error ? <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-100">{error}</p> : null}
    </section>
  );
}
