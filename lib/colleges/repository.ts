import collegesData from "@/data/colleges.json";
import { supabase } from "@/utils/supabase";
import type { CollegeRecord, CreateCollegeInput, UpdateCollegeInput } from "@/types/college";

const DEFAULT_PLACEMENTS = {
  averagePackage: "₹0 LPA",
  highestPackage: "₹0 LPA",
  recruiters: [],
};

const DEFAULT_FEES = {
  tuition: "₹0 / year",
  hostel: "₹0 / year",
  transport: "₹0 / year",
  other: "",
};

const DEFAULT_INSIGHTS = {
  codingCulture: "",
  attendance: "",
  placementReality: "",
  hostelReview: "",
  campusLife: "",
  studentLife: "",
};

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function stripUnsupportedFields(payload: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(payload).filter(([key]) => key !== "gallery_images" && key !== "facilities")
  ) as Record<string, unknown>;
}

export async function createCollege(input: CreateCollegeInput, client = supabase) {
  const normalizedSlug = normalizeSlug(input.slug || "");

  if (!normalizedSlug) {
    throw new Error("A valid slug is required.");
  }

  const { data: existingCollege, error: existingError } = await client
    .from("colleges")
    .select("id")
    .eq("slug", normalizedSlug)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existingCollege) {
    throw new Error("A college with this slug already exists.");
  }

  const payload = {
    name: input.name,
    slug: normalizedSlug,
    location: input.location,
    district: input.district,
    university: input.university,
    naac_grade: input.naac_grade,
    website: input.website ?? null,
    description: input.description ?? null,
    cover_image_url: input.cover_image_url ?? null,
    gallery_images: input.gallery_images ?? [],
    placements: input.placements ?? DEFAULT_PLACEMENTS,
    fees: input.fees ?? DEFAULT_FEES,
    student_insights: input.student_insights ?? DEFAULT_INSIGHTS,
    facilities: input.facilities ?? [],
    branches: input.branches ?? [],
    verification_status: input.verification_status ?? 'verified',
    last_verified: input.last_verified ?? null,
    source_url: input.source_url ?? null,
    autonomous: false,
    status: input.status ?? "draft",
  };

  const tryInsert = async (record: Record<string, unknown>) => {
    return client
      .from("colleges")
      .insert(record)
      .select("*")
      .single();
  };

  const { data, error } = await tryInsert(payload);

  if (error && /gallery_images|facilities/i.test(error.message || "")) {
    const fallbackPayload = stripUnsupportedFields(payload);
    const fallback = await tryInsert(fallbackPayload);

    if (fallback.error) {
      throw fallback.error;
    }

    return fallback.data as CollegeRecord;
  }

  if (error) {
    throw error;
  }

  return data as CollegeRecord;
}

export async function getCollegeBySlug(slug: string, client = supabase) {
  try {
    const { data, error } = await client
      .from("colleges")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw error;
    }

    return data as CollegeRecord;
  } catch {
    return (collegesData as unknown as CollegeRecord[]).find((college) => college.slug === slug) ?? null;
  }
}

export async function getCollegeById(id: string, client = supabase) {
  try {
    const { data, error } = await client
      .from("colleges")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data as CollegeRecord | null;
  } catch {
    return (collegesData as unknown as CollegeRecord[]).find((college) => college.id === id) ?? null;
  }
}

export async function getAllColleges(client = supabase) {
  try {
    const { data, error } = await client
      .from("colleges")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []) as CollegeRecord[];
  } catch {
    return collegesData as unknown as CollegeRecord[];
  }
}

export async function getPublishedColleges(client = supabase) {
  try {
    const { data, error } = await client
      .from("colleges")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []) as CollegeRecord[];
  } catch {
    return collegesData as unknown as CollegeRecord[];
  }
}

export async function updateCollege(
  id: string,
  input: UpdateCollegeInput,
  client = supabase
) {
  const payload: Record<string, unknown> = {};

  if (input.name !== undefined) payload.name = input.name;
  if (input.location !== undefined) payload.location = input.location;
  if (input.district !== undefined) payload.district = input.district;
  if (input.university !== undefined) payload.university = input.university;
  if (input.naac_grade !== undefined) payload.naac_grade = input.naac_grade;
  if (input.website !== undefined) payload.website = input.website ?? null;
  if (input.description !== undefined) payload.description = input.description ?? null;
  if (input.branches !== undefined) payload.branches = input.branches;
  if (input.placements !== undefined) payload.placements = input.placements;
  if (input.fees !== undefined) payload.fees = input.fees;
  if (input.student_insights !== undefined) payload.student_insights = input.student_insights;
  if (input.autonomous !== undefined) payload.autonomous = input.autonomous;
  if (input.status !== undefined) payload.status = input.status;

  if (input.slug !== undefined) {
    const normalizedSlug = normalizeSlug(input.slug);
    if (!normalizedSlug) {
      throw new Error("A valid slug is required.");
    }

    const { data: existingCollege, error: existingError } = await client
      .from("colleges")
      .select("id")
      .eq("slug", normalizedSlug)
      .neq("id", id)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existingCollege) {
      throw new Error("A college with this slug already exists.");
    }

    payload.slug = normalizedSlug;
  }

  if (input.cover_image_url !== undefined) payload.cover_image_url = input.cover_image_url ?? null;
  if (input.gallery_images !== undefined) payload.gallery_images = input.gallery_images ?? [];
  if (input.facilities !== undefined) payload.facilities = input.facilities ?? [];
  if (input.verification_status !== undefined) payload.verification_status = input.verification_status;
  if (input.last_verified !== undefined) payload.last_verified = input.last_verified ?? null;
  if (input.source_url !== undefined) payload.source_url = input.source_url ?? null;
  if (input.student_insights !== undefined) payload.student_insights = input.student_insights;

  payload.updated_at = new Date().toISOString();

  const tryUpdate = async (record: Record<string, unknown>) => {
    return client
      .from("colleges")
      .update(record)
      .eq("id", id)
      .select("*")
      .single();
  };

  const { data, error } = await tryUpdate(payload);

  if (error && /gallery_images|facilities/i.test(error.message || "")) {
    const fallbackPayload = stripUnsupportedFields(payload);
    const fallback = await tryUpdate(fallbackPayload);

    if (fallback.error) {
      throw fallback.error;
    }

    return fallback.data as CollegeRecord;
  }

  if (error) {
    throw error;
  }

  return data as CollegeRecord;
}

export async function updateCollegeStatus(
  id: string,
  status: "draft" | "published" | "archived",
  client = supabase
) {
  const { data, error } = await client
    .from("colleges")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as CollegeRecord;
}

export async function deleteCollege(id: string, client = supabase) {
  const { data, error } = await client
    .from("colleges")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    throw error;
  }

  return data?.[0] ?? null;
}
