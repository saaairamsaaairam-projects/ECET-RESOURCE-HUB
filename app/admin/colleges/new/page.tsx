"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function NewCollegePage() {
  const router = useRouter();
  const { isAdmin, loading } = useAuth();
  const facilityOptions = [
    "Library",
    "Hostel",
    "Transport",
    "Sports",
    "Labs",
    "WiFi",
    "Medical",
    "Gym",
  ];

  const [form, setForm] = useState({
    name: "",
    slug: "",
    location: "",
    district: "",
    university: "",
    naac_grade: "A",
    website: "",
    description: "",
    verification_status: "verified",
    last_verified: "",
    source_url: "",
    status: "draft",
  });
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [placements, setPlacements] = useState({
    averagePackage: "",
    highestPackage: "",
    recruiters: "",
  });
  const [fees, setFees] = useState({
    tuition: "",
    hostel: "",
    transport: "",
  });
  const [coverImageUrl, setCoverImageUrl] = useState<string>("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [facilities, setFacilities] = useState<string[]>([]);
  const [studentInsights, setStudentInsights] = useState({
    codingCulture: "",
    attendance: "",
    placementReality: "",
    hostelReview: "",
    campusLife: "",
    studentLife: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [branchInput, setBranchInput] = useState("");
  const [branches, setBranches] = useState<string[]>([]);
  const [cutoffRows, setCutoffRows] = useState([
    { branch: "", year: "2026", closingRank: "" },
  ]);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (!slugTouched) {
      const generatedSlug = slugify(form.name);
      setForm((current) => ({
        ...current,
        slug: generatedSlug || current.slug,
      }));
    }
  }, [form.name, slugTouched]);

  if (loading) {
    return <div className="min-h-screen bg-[#0f0e17] text-white pt-24 px-6">Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0f0e17] text-white pt-24 px-6 flex items-center justify-center">
        <div className="max-w-xl rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <h1 className="text-3xl font-bold">Access Denied</h1>
          <p className="mt-3 text-gray-300">Only admins can create colleges.</p>
        </div>
      </div>
    );
  }

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
    setCutoffRows((current) => [...current, { branch: branches[0] ?? "", year: "2026", closingRank: "" }]);
  };

  const updateCutoffRow = (index: number, field: "branch" | "year" | "closingRank", value: string) => {
    setCutoffRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)));
  };

  const removeCutoffRow = (index: number) => {
    setCutoffRows((current) => current.filter((_, rowIndex) => rowIndex !== index));
  };

  const handleToggleFacility = (facility: string) => {
    setFacilities((current) =>
      current.includes(facility)
        ? current.filter((item) => item !== facility)
        : [...current, facility]
    );
  };

  const handleUploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/colleges/upload-image", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error || "Image upload failed.");
    }

    const json = await res.json();
    return json.imageUrl as string;
  };

  const addGalleryImages = async (files: FileList | null) => {
    if (!files) return;
    setGalleryUploading(true);
    try {
      const uploads = Array.from(files).map(handleUploadImage);
      const urls = await Promise.all(uploads);
      setGalleryImages((current) => [...current, ...urls]);
    } catch (error) {
      console.error(error);
      setError(error instanceof Error ? error.message : "Failed to upload gallery images.");
    } finally {
      setGalleryUploading(false);
    }
  };

  const removeGalleryImage = (url: string) => {
    setGalleryImages((current) => current.filter((item) => item !== url));
  };

  const removeCoverImage = () => {
    setCoverImageUrl("");
  };

  const validateWizard = () => {
    const uniqueBranches = new Set(branches.map((branch) => branch.toUpperCase()));
    if (branches.length === 0) {
      setError("Add at least one branch before continuing.");
      return false;
    }

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
    setSaving(true);
    setError("");

    try {
      if (!validateWizard()) {
        setSaving(false);
        return;
      }

      const payload = {
        ...form,
        cover_image_url: coverImageUrl || undefined,
        gallery_images: galleryImages,
        facilities,
        student_insights: studentInsights,
        branches,
        verification_status: form.verification_status || "verified",
        last_verified: form.last_verified || null,
        source_url: form.source_url || null,
        placements: {
          averagePackage: placements.averagePackage || undefined,
          highestPackage: placements.highestPackage || undefined,
          recruiters: placements.recruiters
            ? placements.recruiters.split(",").map((r) => r.trim()).filter(Boolean)
            : undefined,
        },
        fees: {
          tuition: fees.tuition || undefined,
          hostel: fees.hostel || undefined,
          transport: fees.transport || undefined,
        },
        ecet_cutoffs: cutoffRows
          .filter((row) => row.branch && row.closingRank)
          .map((row) => ({
            branch: row.branch,
            year: Number(row.year),
            closing_rank: Number(row.closingRank),
          })),
      };

      console.log("SUBMIT PAYLOAD", payload);

      const response = await fetch("/api/admin/colleges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        const message = result?.error || result?.message || "Unable to save the college.";
        if (response.status === 409 || /slug.*already exists/i.test(message)) {
          throw new Error("This slug is already in use. Please choose a different one.");
        }
        throw new Error(message);
      }

      router.push("/admin/colleges");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0f0e17] px-6 py-24 text-white">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-purple-300">Admin / Colleges</p>
            <h1 className="text-3xl font-bold text-white">Create College</h1>
            <p className="text-gray-300">This wizard step saves the basic college profile to Supabase.</p>
          </div>
          <Link href="/admin/colleges" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:border-purple-400/40 hover:bg-white/10">Back to list</Link>
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
                      value={form[field as keyof typeof form]}
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

                <label className="flex flex-col gap-2 text-sm text-gray-200">
                  <span>Status</span>
                  <select
                    value={form.status}
                    onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-purple-400/80"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </label>
              </div>

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
                <button type="button" onClick={() => setStep(2)} className="rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white">Next: Placements & Fees</button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm text-gray-200"><span>Average Package</span><input value={placements.averagePackage} onChange={(e) => setPlacements((c) => ({ ...c, averagePackage: e.target.value }))} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" /></label>
                <label className="flex flex-col gap-2 text-sm text-gray-200"><span>Highest Package</span><input value={placements.highestPackage} onChange={(e) => setPlacements((c) => ({ ...c, highestPackage: e.target.value }))} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" /></label>
                <label className="flex flex-col gap-2 text-sm text-gray-200 md:col-span-2"><span>Recruiters (comma separated)</span><input value={placements.recruiters} onChange={(e) => setPlacements((c) => ({ ...c, recruiters: e.target.value }))} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" /></label>
                <label className="flex flex-col gap-2 text-sm text-gray-200"><span>Tuition Fee</span><input value={fees.tuition} onChange={(e) => setFees((c) => ({ ...c, tuition: e.target.value }))} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" /></label>
                <label className="flex flex-col gap-2 text-sm text-gray-200"><span>Hostel Fee</span><input value={fees.hostel} onChange={(e) => setFees((c) => ({ ...c, hostel: e.target.value }))} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" /></label>
                <label className="flex flex-col gap-2 text-sm text-gray-200"><span>Transport Fee</span><input value={fees.transport} onChange={(e) => setFees((c) => ({ ...c, transport: e.target.value }))} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" /></label>
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
                <div><h2 className="text-xl font-semibold text-white">Section A — Branches</h2><p className="text-sm text-gray-300">Add each branch once. These will be saved as a text array.</p></div>
                <div className="flex flex-wrap gap-3"><input value={branchInput} onChange={(e) => setBranchInput(e.target.value)} placeholder="e.g. CSE" className="min-w-[180px] flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" /><button type="button" onClick={addBranch} className="rounded-xl border border-purple-400/40 bg-purple-500/10 px-4 py-3 text-sm font-semibold text-purple-100">Add Branch</button></div>
                <div className="flex flex-wrap gap-2">{branches.length === 0 ? <span className="text-sm text-gray-400">No branches added yet.</span> : branches.map((branch) => <button key={branch} type="button" onClick={() => removeBranch(branch)} className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm text-white hover:border-rose-400/40 hover:bg-rose-500/10">{branch} ×</button>)}</div>
              </section>
              <section className="space-y-4 rounded-2xl border border-white/10 bg-black/10 p-4">
                <div><h2 className="text-xl font-semibold text-white">Section B — ECET Cutoffs</h2><p className="text-sm text-gray-300">Add branch/year/closing-rank rows. These will be saved to the ECET cutoff table.</p></div>
                <div className="overflow-x-auto rounded-xl border border-white/10"><table className="min-w-full text-left text-sm text-gray-100"><thead className="bg-black/20 text-gray-200"><tr><th className="px-3 py-2">Branch</th><th className="px-3 py-2">Year</th><th className="px-3 py-2">Closing Rank</th><th className="px-3 py-2">Action</th></tr></thead><tbody>{cutoffRows.map((row, index) => <tr key={index} className="border-t border-white/10"><td className="px-3 py-2"><select value={row.branch} onChange={(e) => updateCutoffRow(index, "branch", e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white"><option value="">Select branch</option>{branches.map((branch) => <option key={branch} value={branch}>{branch}</option>)}</select></td><td className="px-3 py-2"><select value={row.year} onChange={(e) => updateCutoffRow(index, "year", e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white"><option value="2023">2023</option><option value="2024">2024</option><option value="2025">2025</option><option value="2026">2026</option></select></td><td className="px-3 py-2"><input type="number" min="1" value={row.closingRank} onChange={(e) => updateCutoffRow(index, "closingRank", e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white" /></td><td className="px-3 py-2"><button type="button" onClick={() => removeCutoffRow(index)} className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">Remove</button></td></tr>)}</tbody></table></div>
                <div className="flex gap-3"><button type="button" onClick={addCutoffRow} className="rounded-xl border border-purple-400/40 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-100">Add Row</button></div>
              </section>
              {error ? <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-100">{error}</p> : null}
              <div className="flex items-center justify-between gap-3"><button type="button" onClick={() => setStep(2)} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white">Back</button><button type="button" onClick={() => setStep(4)} className="rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white">Next: Images & Insights</button></div>
            </>
          )}

          {step === 4 && (
            <>
              <section className="space-y-6 rounded-2xl border border-white/10 bg-black/10 p-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Images</h2>
                  <p className="text-sm text-gray-300">Upload a cover image and gallery photos for the college.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <label className="block text-sm text-gray-200">Cover Image</label>
                    {coverImageUrl ? (
                      <div className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-3">
                        <Image src={coverImageUrl} alt="Cover preview" width={800} height={480} className="h-48 w-full rounded-2xl object-cover" />
                        <button type="button" onClick={removeCoverImage} className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-2 text-sm text-rose-100">Remove Cover Image</button>
                      </div>
                    ) : (
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (event) => {
                          const file = event.target.files?.[0];
                          if (!file) return;
                          try {
                            const url = await handleUploadImage(file);
                            setCoverImageUrl(url);
                          } catch (uploadError) {
                            setError(uploadError instanceof Error ? uploadError.message : String(uploadError));
                          }
                        }}
                        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white"
                      />
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm text-gray-200">Gallery Images</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(event) => addGalleryImages(event.target.files)}
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white"
                    />
                    {galleryUploading && <p className="text-sm text-gray-300">Uploading images...</p>}
                    <div className="grid gap-3 sm:grid-cols-2">
                      {galleryImages.map((url) => (
                        <div key={url} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                          <Image src={url} alt="Gallery preview" width={400} height={160} className="h-40 w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(url)}
                            className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-4 rounded-2xl border border-white/10 bg-black/10 p-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Facilities</h2>
                  <p className="text-sm text-gray-300">Choose the facilities available at the college.</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {facilityOptions.map((facility) => (
                    <button
                      key={facility}
                      type="button"
                      onClick={() => handleToggleFacility(facility)}
                      className={`rounded-2xl border px-3 py-2 text-left text-sm transition ${facilities.includes(facility) ? "border-purple-400 bg-purple-500/10 text-white" : "border-white/10 bg-black/20 text-gray-200 hover:border-purple-400/40"}`}
                    >
                      {facility}
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-4 rounded-2xl border border-white/10 bg-black/10 p-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Student Insights</h2>
                  <p className="text-sm text-gray-300">Add the college experience details for coding culture, campus life, and more.</p>
                </div>
                {[
                  ["codingCulture", "Coding Culture"],
                  ["attendance", "Attendance"],
                  ["placementReality", "Placement Reality"],
                  ["hostelReview", "Hostel Review"],
                  ["campusLife", "Campus Life"],
                  ["studentLife", "Student Life"],
                ].map(([field, label]) => (
                  <label key={field} className="flex flex-col gap-2 text-sm text-gray-200">
                    <span>{label}</span>
                    <textarea
                      rows={3}
                      value={studentInsights[field as keyof typeof studentInsights]}
                      onChange={(event) => setStudentInsights((current) => ({ ...current, [field]: event.target.value }))}
                      className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-purple-400/80"
                    />
                  </label>
                ))}
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
              <section className="space-y-3 rounded-2xl border border-white/10 bg-black/10 p-4"><h2 className="text-xl font-semibold text-white">Review & Publish</h2><p className="text-sm text-gray-300">Confirm the details below before saving this college profile.</p><ul className="space-y-2 text-sm text-gray-100"><li><span className="text-gray-300">Name:</span> {form.name}</li><li><span className="text-gray-300">Slug:</span> {form.slug}</li><li><span className="text-gray-300">Location:</span> {form.location}</li><li><span className="text-gray-300">University:</span> {form.university}</li><li><span className="text-gray-300">Branches:</span> {branches.join(", ") || "None"}</li><li><span className="text-gray-300">Facilities:</span> {facilities.join(", ") || "None"}</li><li><span className="text-gray-300">Gallery Images:</span> {galleryImages.length}</li><li><span className="text-gray-300">ECET Cutoff Rows:</span> {cutoffRows.filter((row) => row.branch && row.closingRank).length}</li></ul></section>
              {error ? <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-100">{error}</p> : null}
              <div className="flex items-center justify-between gap-3"><button type="button" onClick={() => setStep(4)} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white">Back</button><div className="flex gap-3"><Link href="/admin/colleges" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white">Cancel</Link><button type="submit" disabled={saving} className="rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Saving..." : "Save College"}</button></div></div>
            </>
          )}
        </form>
      </div>
    </main>
  );
}
