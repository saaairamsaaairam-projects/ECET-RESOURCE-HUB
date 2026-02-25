"use client";

import * as XLSX from "xlsx";
import { useState } from "react";
import { supabase } from "@/utils/supabase";

export default function BulkUploadModal({ topicId, onClose, onUploaded }: any) {
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [fileObj, setFileObj] = useState<File | null>(null);

  const handleFile = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileObj(file);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: null });

      // Normalize keys to lowercase with underscores
      const normalized = json.map((row: any) => {
        const r: any = {};
        for (const k of Object.keys(row)) {
          const key = String(k).trim().toLowerCase().replace(/\s+/g, "_");
          r[key] = row[k];
        }
        return r;
      });

      // Validate expected columns
      for (const row of normalized) {
        if (
          !row.question ||
          !row.option_a ||
          !row.option_b ||
          !row.option_c ||
          !row.option_d ||
          !row.correct_answer
        ) {
          setError("⚠ Missing one or more required fields in file. Required: question, option_a, option_b, option_c, option_d, correct_answer");
          setRows([]);
          return;
        }
      }

      setRows(normalized);
      setError("");
    } catch (err) {
      console.error("Bulk parse error:", err);
      setError("Failed to parse file. Ensure it's a valid .xlsx or .csv");
      setRows([]);
    }
  };

  const upload = async () => {
    try {
      if (!fileObj) {
        setError("Missing file to upload");
        return;
      }

      // Attach auth token from Supabase session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError("You must be logged in as an admin to upload.");
        return;
      }

      const token = session.access_token;

      const form = new FormData();
      form.append("file", fileObj);
      form.append("topicId", String(topicId));

      const res = await fetch("/api/practice/bulk-upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error || "Failed to upload");
        return;
      }

      onUploaded?.();
      onClose?.();
    } catch (err) {
      console.error("Bulk upload error:", err);
      setError("Network error while uploading");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded w-[640px]">
        <h2 className="text-xl font-bold mb-3 text-white">Bulk Upload MCQs</h2>

        <input type="file" accept=".xlsx,.csv" onChange={handleFile} className="border p-2 rounded" />

        {error && <p className="text-red-400 mt-2">{error}</p>}

        {rows.length > 0 && (
          <>
            <p className="mt-3 text-green-400">Parsed {rows.length} questions ✔</p>

            <div className="mt-4 max-h-[250px] overflow-y-auto text-sm bg-black/30 p-3 rounded text-white">
              {rows.slice(0, 10).map((r, i) => (
                <div key={i} className="border-b border-gray-700 py-2">
                  <p>Q: {String(r.question)}</p>
                  <p>A: {String(r.option_a)}</p>
                  <p>B: {String(r.option_b)}</p>
                  <p>C: {String(r.option_c)}</p>
                  <p>D: {String(r.option_d)}</p>
                  <p>Correct: {String(r.correct_answer)}</p>
                </div>
              ))}
            </div>

            <button onClick={upload} className="mt-4 w-full bg-purple-600 py-2 rounded text-white">Upload All</button>
          </>
        )}

        <button className="mt-3 text-gray-300" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
