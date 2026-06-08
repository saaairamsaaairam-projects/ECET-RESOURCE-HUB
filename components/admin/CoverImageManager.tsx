"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { deleteCollegeImage, uploadCollegeImage } from "@/lib/colleges/imageService";

interface CoverImageManagerProps {
  collegeId?: string;
  value?: string | null;
  onChange: (imageUrl: string | null) => void;
}

export default function CoverImageManager({ collegeId, value, onChange }: CoverImageManagerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const imageUrl = await uploadCollegeImage(file);
      onChange(imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to upload cover image.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleDelete = async () => {
    if (!value) return;
    setUploading(true);
    setError("");
    try {
      await deleteCollegeImage(value, collegeId);
      onChange(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete cover image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-black/10 p-4">
      <div>
        <h3 className="text-xl font-semibold text-white">Cover Image</h3>
        <p className="text-sm text-gray-300">Upload one primary image for the college hero section and replace it whenever needed.</p>
      </div>

      {value ? (
        <div className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-3">
          <Image src={value} alt="College cover preview" width={900} height={540} className="h-48 w-full rounded-2xl object-cover" />
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => inputRef.current?.click()} className="rounded-xl border border-purple-400/40 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-100">Replace</button>
            <button type="button" onClick={handleDelete} disabled={uploading} className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-100 disabled:opacity-60">Delete</button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 p-4 text-sm text-gray-300">No cover image yet. Upload one to make the college profile feel complete.</div>
      )}

      <input ref={inputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
      <button type="button" onClick={() => inputRef.current?.click()} className="rounded-xl border border-purple-400/40 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-100">Upload Cover Image</button>
      {uploading ? <p className="text-sm text-gray-300">Updating image…</p> : null}
      {error ? <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-100">{error}</p> : null}
    </section>
  );
}
