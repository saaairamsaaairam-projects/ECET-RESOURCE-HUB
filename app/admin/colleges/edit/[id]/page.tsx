"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import CoverImageManager from "@/components/admin/CoverImageManager";
import GalleryImageManager from "@/components/admin/GalleryImageManager";

type CutoffRow = {
  branch: string;
  year: string;
  closingRank: string;
};

type CollegeFormState = {
  name: string;
  slug: string;
  location: string;
  district: string;
  university: string;
  naac_grade: string;
  website: string;
  description: string;
  facilities: string;
  verification_status: string;
  last_verified: string;
  source_url: string;
  status: "draft" | "published" | "archived";
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function EditCollegePage() {
  const { id } = useParams();
  const { isAdmin, loading } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();

  const [form, setForm] = useState<CollegeFormState>({
    name: "",
    slug: "",
    location: "",
    district: "",
    university: "",
    naac_grade: "A",
    website: "",
    description: "",
    facilities: "",
    verification_status: "verified",
    last_verified: "",
    source_url: "",
    status: "draft",
  });
  const [placements, setPlacements] = useState({
    averagePackage: "",
    highestPackage: "",
    recruiters: "",
  });
  const [fees, setFees] = useState({
    tuition: "",
    hostel: "",
    transport: "",
    other: "",
  });
  const [branches, setBranches] = useState<string[]>([]);
  const [branchInput, setBranchInput] = useState("");
  const [cutoffRows, setCutoffRows] = useState<CutoffRow[]>([
    { branch: "", year: "2026", closingRank: "" },
  ]);
  const [slugTouched, setSlugTouched] = useState(false);
  const [loadingCollege, setLoadingCollege] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  useEffect(() => {
    if (!slugTouched) {
      const generatedSlug = slugify(form.name);
      setForm((current) => ({
        ...current,
        slug: generatedSlug || current.slug,
      }));
    }
  }, [form.name, slugTouched]);

  useEffect(() => {
    if (loading || !isAdmin || !id) return;

    const fetchCollege = async () => {
      setLoadingCollege(true);
      setError("");
      setNotFound(false);

      try {
        const response = await fetch(`/api/admin/colleges/${id}`, {
          cache: "no-store",
        });
        if (response.status === 404) {
          setNotFound(true);
          return;
        }
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result?.error || "Unable to load college details.");
        }

        const college = result.college;
        if (!college) {
          setNotFound(true);
          return;
        }

        setForm({
          name: college.name || "",
          slug: college.slug || "",
          location: college.location || "",
          district: college.district || "",
          university: college.university || "",
          naac_grade: college.naac_grade || "A",
          website: college.website || "",
          description: college.description || "",
          facilities: Array.isArray(college.facilities) ? college.facilities.join(", ") : "",
          verification_status: college.verification_status || "verified",
          last_verified: college.last_verified ? String(college.last_verified).slice(0, 10) : "",
          source_url: college.source_url || "",
          status: (college.status as "draft" | "published" | "archived") || "draft",
        });
        setPlacements({
          averagePackage: college.placements?.averagePackage || "",
          highestPackage: college.placements?.highestPackage || "",
          recruiters: college.placements?.recruiters?.join(", ") || "",
        });
        setFees({
          tuition: college.fees?.tuition || "",
          hostel: college.fees?.hostel || "",
          transport: college.fees?.transport || "",
          other: college.fees?.other || "",
        });
        setBranches(college.branches || []);
        setCoverImageUrl(college.cover_image_url || "");
        setGalleryImages(Array.isArray(college.gallery_images) ? college.gallery_images.filter(Boolean) : []);
        setBranchInput("");
        setCutoffRows(
          Array.isArray(college.ecet_cutoffs) && college.ecet_cutoffs.length > 0
            ? college.ecet_cutoffs.map((row: { branch?: string; year?: number; closing_rank?: number }) => ({
                branch: row.branch || "",
                year: String(row.year || "2026"),
                closingRank: String(row.closing_rank || ""),
              }))
            : [{ branch: "", year: "2026", closingRank: "" }]
        );
        setSlugTouched(false);
        setStep(1);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to load the college.");
      } finally {
        setLoadingCollege(false);
      }
    };

    void fetchCollege();
  }, [loading, isAdmin, id]);

  const addBranch = () => {
    const nextBranch = branchInput.trim();
    if (!nextBranch) return;
    const normalized = nextBranch.toUpperCase();
    if (branches.some((branch) => branch.toUpperCase() === normalized)) {
      setError("Branch names must be unique.");
      return;
    }
    setBranches((current) => [...current, normalized]);
    setBranchInput("");
    setError("");
  };

  const removeBranch = (branchToRemove: string) => {
    setBranches((current) => current.filter((branch) => branch !== branchToRemove));
  };

  const addCutoffRow = () => {
    setCutoffRows((current) => [
      ...current,
      { branch: branches[0] ?? "", year: "2026", closingRank: "" },
    ]);
  };

  const updateCutoffRow = (index: number, field: keyof CutoffRow, value: string) => {
    setCutoffRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row
      )
    );
  };

  const removeCutoffRow = (index: number) => {
    setCutoffRows((current) => current.filter((_, rowIndex) => rowIndex !== index));
  };

  const validateWizard = () => {
    if (branches.length === 0) {
      setError("Add at least one branch before continuing.");
      return false;
    }
    const uniqueBranches = new Set(branches.map((branch) => branch.toUpperCase()));
    if (uniqueBranches.size !== branches.length) {
      setError("Branch names must be unique.");
      return false;
    }
    for (const row of cutoffRows) {
      if (!row.branch) {
        setError("Each ECET cutoff row must select a branch.");
        return false;
      }
      const closingRank = Number(row.closingRank);
      if (!Number.isFinite(closingRank) || closingRank <= 0) {
        setError("Closing rank must be a positive number.");
        return false;
      }
    }
    setError("");
    return true;
  };

  const handleSubmit = async (event?: React.FormEvent) => {
    if (event) event.preventDefault();
    if (!validateWizard()) return;
    if (!id) {
      setError("Invalid college ID.");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const payload = {
        ...form,
        cover_image_url: coverImageUrl || null,
        gallery_images: galleryImages,
        verification_status: form.verification_status || "verified",
        last_verified: form.last_verified || null,
        source_url: form.source_url || null,
        branches,
        placements: {
          averagePackage: placements.averagePackage || undefined,
          highestPackage: placements.highestPackage || undefined,
          recruiters: placements.recruiters
            ? placements.recruiters.split(",").map((item) => item.trim()).filter(Boolean)
            : undefined,
        },
        fees: {
          tuition: fees.tuition || undefined,
          hostel: fees.hostel || undefined,
          transport: fees.transport || undefined,
          other: fees.other || undefined,
        },
        facilities: form.facilities
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        ecet_cutoffs: cutoffRows
          .filter((row) => row.branch && row.closingRank)
          .map((row) => ({
            branch: row.branch,
            year: Number(row.year),
            closing_rank: Number(row.closingRank),
          })),
      };

      const response = await fetch(`/api/admin/colleges/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || "Unable to update the college.");
      }

      addToast("College updated successfully.", "success");
      router.push("/admin/colleges");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save college.";
      setError(message);
      addToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0f0e17] text-white pt-24 px-6">Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0f0e17] text-white pt-24 px-6 flex items-center justify-center">
        <div className="max-w-xl rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <h1 className="text-3xl font-bold">Access Denied</h1>
          <p className="mt-3 text-gray-300">Only admins can edit colleges.</p>
        </div>
      </div>
    );
  }

  if (loadingCollege) {
    return <div className="min-h-screen bg-[#0f0e17] text-white pt-24 px-6">Loading college details…</div>;
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#0f0e17] text-white pt-24 px-6 flex items-center justify-center">
        <div className="max-w-xl rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <h1 className="text-3xl font-bold mb-3">College Not Found</h1>
          <p className="text-gray-300 mb-6">The college you are trying to edit does not exist.</p>
          <Link href="/admin/colleges" className="rounded-xl bg-purple-600 px-5 py-3 text-white hover:bg-purple-500">
            Return to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f0e17] px-6 py-24 text-white">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-purple-300">Admin / Colleges</p>
            <h1 className="text-3xl font-bold text-white">Edit College</h1>
            <p className="text-gray-300">Update the college profile, branches, ECET cutoffs, and status.</p>
          </div>
          <Link href="/admin/colleges" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:border-purple-400/40 hover:bg-white/10">
            Back to list
          </Link>
        </div>

        <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/5 p-2">
          {[
            [1, "General"],
            [2, "Placements"],
            [3, "Fees & Branches"],
            [4, "Images"],
            [5, "Review"],
          ].map(([value, label]) => (
            <button key={value} type="button" onClick={() => setStep(value as 1 | 2 | 3 | 4 | 5)} className={`rounded-xl px-4 py-2 text-sm font-semibold ${step === value ? "bg-purple-500 text-white" : "bg-black/20 text-gray-200 hover:bg-white/10"}`}>
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl space-y-5">
          {step === 1 && (
            <>
              <div className="grid gap-5 md:grid-cols-2">
                {[
                  ["name", "College Name"],
                  ["slug", "Slug"],
                  ["location", "Location"],
                  ["district", "District"],
                  ["university", "University"],
                  ["naac_grade", "NAAC Grade"],
                  ["website", "Website"],
                ].map(([field, label]) => (
                  <label key={field} className="flex flex-col gap-2 text-sm text-gray-200">
                    <span>{label}</span>
                    <input
                      required={field !== "website"}
                      type={field === "website" ? "url" : "text"}
                      value={form[field as keyof CollegeFormState] || ""}
                      onChange={(event) => {
                        const nextValue = event.target.value;
                        setForm((current) => ({ ...current, [field]: nextValue }));
                        if (field === "slug") {
                          setSlugTouched(true);
                        }
                      }}
                      className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none ring-0 transition focus:border-purple-400/80"
                    />
                  </label>
                ))}
              </div>

              <label className="flex flex-col gap-2 text-sm text-gray-200">
                <span>Verification Status</span>
                <select
                  value={form.verification_status}
                  onChange={(event) => setForm((current) => ({ ...current, verification_status: event.target.value }))}
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-purple-400/80"
                >
                  <option value="verified">Verified</option>
                  <option value="needs_review">Needs Review</option>
                  <option value="pending">Pending</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm text-gray-200">
                <span>Last Verified</span>
                <input
                  type="date"
                  value={form.last_verified}
                  onChange={(event) => setForm((current) => ({ ...current, last_verified: event.target.value }))}
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-purple-400/80"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-gray-200 md:col-span-2">
                <span>Source URL</span>
                <input
                  type="url"
                  value={form.source_url}
                  onChange={(event) => setForm((current) => ({ ...current, source_url: event.target.value }))}
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-purple-400/80"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-gray-200 md:col-span-2">
                <span>Facilities (comma separated)</span>
                <textarea
                  rows={3}
                  value={form.facilities}
                  onChange={(event) => setForm((current) => ({ ...current, facilities: event.target.value }))}
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-purple-400/80"
                  placeholder="Library, Hostel, Wi-Fi, Placement Cell"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-gray-200">
                <span>Status</span>
                <select
                  value={form.status}
                  onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as CollegeFormState["status"] }))}
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-purple-400/80"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm text-gray-200">
                <span>Description</span>
                <textarea
                  rows={5}
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-purple-400/80"
                />
              </label>

              {error ? <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-100">{error}</p> : null}

              <div className="flex items-center justify-between gap-3">
                <Link href="/admin/colleges" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white">Cancel</Link>
                <button type="button" onClick={() => setStep(2)} className="rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white">
                  Next: Placements & Fees
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm text-gray-200">
                  <span>Average Package</span>
                  <input
                    value={placements.averagePackage}
                    onChange={(e) => setPlacements((current) => ({ ...current, averagePackage: e.target.value }))}
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-gray-200">
                  <span>Highest Package</span>
                  <input
                    value={placements.highestPackage}
                    onChange={(e) => setPlacements((current) => ({ ...current, highestPackage: e.target.value }))}
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-gray-200 md:col-span-2">
                  <span>Recruiters (comma separated)</span>
                  <input
                    value={placements.recruiters}
                    onChange={(e) => setPlacements((current) => ({ ...current, recruiters: e.target.value }))}
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-gray-200">
                  <span>Tuition Fee</span>
                  <input
                    value={fees.tuition}
                    onChange={(e) => setFees((current) => ({ ...current, tuition: e.target.value }))}
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-gray-200">
                  <span>Hostel Fee</span>
                  <input
                    value={fees.hostel}
                    onChange={(e) => setFees((current) => ({ ...current, hostel: e.target.value }))}
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-gray-200">
                  <span>Transport Fee</span>
                  <input
                    value={fees.transport}
                    onChange={(e) => setFees((current) => ({ ...current, transport: e.target.value }))}
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-gray-200 md:col-span-2">
                  <span>Other Fee Note</span>
                  <input
                    value={fees.other}
                    onChange={(e) => setFees((current) => ({ ...current, other: e.target.value }))}
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white"
                  />
                </label>
              </div>
              {error ? <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-100">{error}</p> : null}
              <div className="flex items-center justify-between gap-3">
                <button type="button" onClick={() => setStep(1)} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white">Back</button>
                <button type="button" onClick={() => setStep(3)} className="rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white">Next: Branches & ECET</button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <section className="space-y-4 rounded-2xl border border-white/10 bg-black/10 p-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Section A — Branches</h2>
                  <p className="text-sm text-gray-300">Add each branch once. These will be saved as a text array.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <input
                    value={branchInput}
                    onChange={(e) => setBranchInput(e.target.value)}
                    placeholder="e.g. CSE"
                    className="min-w-[180px] flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white"
                  />
                  <button type="button" onClick={addBranch} className="rounded-xl border border-purple-400/40 bg-purple-500/10 px-4 py-3 text-sm font-semibold text-purple-100">
                    Add Branch
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {branches.length === 0 ? (
                    <span className="text-sm text-gray-400">No branches added yet.</span>
                  ) : (
                    branches.map((branch) => (
                      <button key={branch} type="button" onClick={() => removeBranch(branch)} className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm text-white hover:border-rose-400/40 hover:bg-rose-500/10">
                        {branch} ×
                      </button>
                    ))
                  )}
                </div>
              </section>

              <section className="space-y-4 rounded-2xl border border-white/10 bg-black/10 p-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Section B — ECET Cutoffs</h2>
                  <p className="text-sm text-gray-300">Add branch/year/closing-rank rows. These will be saved to the ECET cutoff table.</p>
                </div>
                <div className="overflow-x-auto rounded-xl border border-white/10">
                  <table className="min-w-full text-left text-sm text-gray-100">
                    <thead className="bg-black/20 text-gray-200">
                      <tr>
                        <th className="px-3 py-2">Branch</th>
                        <th className="px-3 py-2">Year</th>
                        <th className="px-3 py-2">Closing Rank</th>
                        <th className="px-3 py-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cutoffRows.map((row, index) => (
                        <tr key={index} className="border-t border-white/10">
                          <td className="px-3 py-2">
                            <select
                              value={row.branch}
                              onChange={(e) => updateCutoffRow(index, "branch", e.target.value)}
                              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white"
                            >
                              <option value="">Select branch</option>
                              {branches.map((branch) => (
                                <option key={branch} value={branch}>{branch}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={row.year}
                              onChange={(e) => updateCutoffRow(index, "year", e.target.value)}
                              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white"
                            >
                              <option value="2023">2023</option>
                              <option value="2024">2024</option>
                              <option value="2025">2025</option>
                              <option value="2026">2026</option>
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              min="1"
                              value={row.closingRank}
                              onChange={(e) => updateCutoffRow(index, "closingRank", e.target.value)}
                              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <button
                              type="button"
                              onClick={() => removeCutoffRow(index)}
                              className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={addCutoffRow} className="rounded-xl border border-purple-400/40 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-100">
                    Add Row
                  </button>
                </div>
              </section>

              {error ? <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-100">{error}</p> : null}
              <div className="flex items-center justify-between gap-3">
                <button type="button" onClick={() => setStep(2)} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white">Back</button>
                <button type="button" onClick={() => setStep(4)} className="rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white">Next: Images</button>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <section className="space-y-6 rounded-2xl border border-white/10 bg-black/10 p-4">
                <CoverImageManager collegeId={id as string} value={coverImageUrl} onChange={setCoverImageUrl} />
                <GalleryImageManager collegeId={id as string} images={galleryImages} onChange={setGalleryImages} />
              </section>

              {error ? <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-100">{error}</p> : null}
              <div className="flex items-center justify-between gap-3">
                <button type="button" onClick={() => setStep(3)} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white">Back</button>
                <button type="button" onClick={() => setStep(5)} className="rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white">Next: Review & Publish</button>
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <section className="space-y-3 rounded-2xl border border-white/10 bg-black/10 p-4">
                <h2 className="text-xl font-semibold text-white">Review & Publish</h2>
                <p className="text-sm text-gray-300">Confirm the details below before saving this college profile.</p>
                <ul className="space-y-2 text-sm text-gray-100">
                  <li><span className="text-gray-300">Name:</span> {form.name}</li>
                  <li><span className="text-gray-300">Slug:</span> {form.slug}</li>
                  <li><span className="text-gray-300">Location:</span> {form.location}</li>
                  <li><span className="text-gray-300">District:</span> {form.district}</li>
                  <li><span className="text-gray-300">University:</span> {form.university}</li>
                  <li><span className="text-gray-300">Branches:</span> {branches.join(", ") || "None"}</li>
                  <li><span className="text-gray-300">Gallery Images:</span> {galleryImages.length}</li>
                  <li><span className="text-gray-300">ECET Cutoff Rows:</span> {cutoffRows.filter((row) => row.branch && row.closingRank).length}</li>
                </ul>
              </section>

              {error ? <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-100">{error}</p> : null}
              <div className="flex items-center justify-between gap-3">
                <button type="button" onClick={() => setStep(4)} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white">Back</button>
                <div className="flex gap-3">
                  <Link href="/admin/colleges" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white">Cancel</Link>
                  <button type="submit" disabled={saving} className="rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
                    {saving ? "Saving..." : "Save College"}
                  </button>
                </div>
              </div>
            </>
          )}
        </form>
      </div>
    </main>
  );
}
