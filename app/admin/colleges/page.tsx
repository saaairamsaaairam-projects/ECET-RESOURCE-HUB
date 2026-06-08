"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ConfirmModal from "@/components/ConfirmModal";
import type { CollegeRecord } from "@/types/college";

export default function AdminCollegesPage() {
  const [colleges, setColleges] = useState<CollegeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const pageSize = 8;

  const loadColleges = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/colleges", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Unable to load colleges");
      setColleges(json.colleges || []);
    } catch (error) {
      console.error(error);
      setColleges([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadColleges();
  }, []);

  const filteredColleges = useMemo(() => {
    const query = search.trim().toLowerCase();
    return colleges.filter((college) => {
      const matchesSearch = !query || [college.name, college.district, college.slug].join(" ").toLowerCase().includes(query);
      const matchesStatus = statusFilter === "all" || (college.status || "draft") === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [colleges, search, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredColleges.length / pageSize));
  const pagedColleges = filteredColleges.slice((page - 1) * pageSize, page * pageSize);

  const stats = {
    total: colleges.length,
    published: colleges.filter((college) => college.status === "published").length,
    draft: colleges.filter((college) => college.status === "draft").length,
    archived: colleges.filter((college) => college.status === "archived").length,
  };

  const updateStatus = async (id: string, nextStatus: "draft" | "published" | "archived") => {
    try {
      const res = await fetch(`/api/admin/colleges/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error("Unable to update status");
      await loadColleges();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteCollege = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/colleges/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Unable to delete college");
      await loadColleges();
    } catch (error) {
      console.error(error);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      await deleteCollege(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0f0e17] px-6 py-24 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-purple-300">Admin / Colleges</p>
            <h1 className="text-3xl font-bold text-white">College Management Dashboard</h1>
            <p className="text-gray-300">Search, filter, publish, archive, and manage all colleges from one place.</p>
          </div>
          <Link href="/admin/colleges/new" className="rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-90">Add College</Link>
        </div>

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <p className="text-sm text-gray-400">Total Colleges</p>
            <p className="mt-3 text-3xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <p className="text-sm text-gray-400">Published</p>
            <p className="mt-3 text-3xl font-bold text-white">{stats.published}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <p className="text-sm text-gray-400">Drafts</p>
            <p className="mt-3 text-3xl font-bold text-white">{stats.draft}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <p className="text-sm text-gray-400">Archived</p>
            <p className="mt-3 text-3xl font-bold text-white">{stats.archived}</p>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by college name, district or slug"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-gray-400 md:max-w-md"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white"
            >
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="mt-6 overflow-x-auto">
            {loading ? (
              <p className="text-gray-300">Loading colleges…</p>
            ) : filteredColleges.length === 0 ? (
              <p className="text-gray-300">No colleges found for the current filters.</p>
            ) : (
              <table className="min-w-full divide-y divide-white/10 text-left text-sm text-gray-100">
                <thead>
                  <tr className="text-gray-300">
                    <th className="px-3 py-3">College Name</th>
                    <th className="px-3 py-3">District</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Updated At</th>
                    <th className="px-3 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {pagedColleges.map((college) => (
                    <tr key={college.id} className="hover:bg-white/5">
                      <td className="px-3 py-4">
                        <div className="font-semibold text-white">{college.name}</div>
                        <div className="text-xs text-gray-400">{college.slug}</div>
                      </td>
                      <td className="px-3 py-4">{college.district}</td>
                      <td className="px-3 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          college.status === "published" ? "bg-emerald-500/15 text-emerald-200" :
                          college.status === "archived" ? "bg-rose-500/15 text-rose-200" : "bg-amber-500/15 text-amber-100"
                        }`}>
                          {college.status || "draft"}
                        </span>
                      </td>
                      <td className="px-3 py-4">{college.updated_at ? new Date(college.updated_at).toLocaleString() : "—"}</td>
                      <td className="px-3 py-4">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Link href={`/tools/colleges/${college.slug}`} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10">View</Link>
                          <Link href={`/admin/colleges/edit/${college.id}`} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10">Edit</Link>
                          {college.status !== "published" && <button onClick={() => updateStatus(college.id, "published")} className="rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs text-emerald-100 hover:bg-emerald-500/25">Publish</button>}
                          {college.status !== "archived" && <button onClick={() => updateStatus(college.id, "archived")} className="rounded-lg bg-amber-500/15 px-3 py-1.5 text-xs text-amber-100 hover:bg-amber-500/25">Archive</button>}
                          <button onClick={() => setDeleteTarget({ id: college.id, name: college.name })} className="rounded-lg bg-rose-500/15 px-3 py-1.5 text-xs text-rose-100 hover:bg-rose-500/25">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-300">
            <span>Showing {pagedColleges.length} of {filteredColleges.length} colleges</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
              <span>Page {page} of {totalPages}</span>
              <button onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-40">Next</button>
            </div>
          </div>
        </section>
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        text={
          deleteTarget
            ? `Delete ${deleteTarget.name}? This action cannot be undone.`
            : ""
        }
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </main>
  );
}
