import type { College } from "@/lib/colleges/types";
import { getCollegeBySlug as getCollegeFromRepo, getPublishedColleges } from "@/lib/colleges/repository";
import type { CollegeRecord } from "@/types/college";

export interface CollegeFilters {
  district?: string;
  naacGrade?: string;
  autonomous?: boolean;
  branch?: string;
}

const FALLBACK_IMAGE = "/college-placeholder.svg";

function asString(value: unknown): string {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? value as Record<string, unknown> : {};
}

function toEcetData(record: CollegeRecord | Record<string, unknown>) {
  const source = record as Record<string, unknown>;

  const rawList = Array.isArray(source.ecetData)
    ? source.ecetData
    : Array.isArray(source.ecet_data)
      ? source.ecet_data
      : [];

  const mappedFromLegacyData = (rawList as Array<Record<string, unknown>>).map((entry) => ({
    branch: String(entry.branch ?? ""),
    cutoff2023: entry.cutoff2023 ? String(entry.cutoff2023) : undefined,
    cutoff2024: entry.cutoff2024 ? String(entry.cutoff2024) : undefined,
    cutoff2025: entry.cutoff2025 ? String(entry.cutoff2025) : undefined,
  }));

  const mappedFromCutoffRows = Array.isArray(source.ecet_cutoffs)
    ? (source.ecet_cutoffs as Array<Record<string, unknown>>).reduce<Record<string, { branch: string; cutoff2023?: string; cutoff2024?: string; cutoff2025?: string }>>((accumulator, entry) => {
        const branch = String(entry.branch ?? "");
        if (!branch) {
          return accumulator;
        }

        const year = Number(entry.year ?? 2025);
        const current = accumulator[branch] ?? { branch, cutoff2023: undefined, cutoff2024: undefined, cutoff2025: undefined };

        if (year === 2023) current.cutoff2023 = String(entry.closing_rank ?? "");
        if (year === 2024) current.cutoff2024 = String(entry.closing_rank ?? "");
        if (year === 2025) current.cutoff2025 = String(entry.closing_rank ?? "");

        accumulator[branch] = current;
        return accumulator;
      }, {})
    : {};

  const combined = [...mappedFromLegacyData, ...Object.values(mappedFromCutoffRows)];
  const deduped = combined.filter((entry, index, list) =>
    entry.branch && list.findIndex((candidate) => candidate.branch === entry.branch) === index
  );

  return deduped;
}

function toCollegeShape(record: CollegeRecord): College {
  const placements = asRecord(record.placements);
  const fees = asRecord(record.fees);
  const studentInsights = asRecord(record.student_insights);
  const galleryImages = asStringArray(record.gallery_images);

  return {
    id: asString(record.id),
    slug: asString(record.slug),
    name: asString(record.name),
    images: {
      cover: asString(record.cover_image_url) || (galleryImages.length > 0 ? galleryImages[0] : FALLBACK_IMAGE),
      gallery: galleryImages.length > 0
        ? galleryImages
        : asString(record.cover_image_url)
          ? [asString(record.cover_image_url)]
          : [FALLBACK_IMAGE],
    },
    location: asString(record.location),
    district: asString(record.district),
    autonomous: Boolean(record.autonomous),
    naacGrade: asString(record.naac_grade) || "A",
    university: asString(record.university),
    website: asString(record.website),
    description: asString(record.description),
    placements: {
      averagePackage: asString(placements.averagePackage) || "₹0 LPA",
      highestPackage: asString(placements.highestPackage) || "₹0 LPA",
      recruiters: asStringArray(placements.recruiters),
    },
    fees: {
      tuition: asString(fees.tuition) || "₹0 / year",
      hostel: asString(fees.hostel) || "₹0 / year",
      transport: asString(fees.transport) || "₹0 / year",
      other: asString(fees.other),
    },
    facilities: asStringArray(record.facilities),
    branches: asStringArray(record.branches),
    ecetData: toEcetData(record),
    ecetCutoffs: Array.isArray(record.ecet_cutoffs)
      ? (record.ecet_cutoffs as Array<{ branch: string; year: number; closing_rank: number }>).map((entry) => ({
          branch: String(entry.branch ?? ""),
          year: Number(entry.year ?? 2025),
          closingRank: Number(entry.closing_rank ?? 0),
        }))
      : undefined,
    verificationStatus: asString(record.verification_status) || "Verified",
    lastVerified: asString(record.last_verified) || undefined,
    sourceUrl: asString(record.source_url) || undefined,
    studentInsights: {
      codingCulture: asString(studentInsights.codingCulture),
      attendance: asString(studentInsights.attendance),
      placementsReality: asString(studentInsights.placementReality),
      hostelReview: asString(studentInsights.hostelReview),
      campusLife: asString(studentInsights.campusLife),
      studentLife: asString(studentInsights.studentLife),
    },
  };
}

export async function getAllColleges(): Promise<College[]> {
  const records = await getPublishedColleges();
  return records.map(toCollegeShape);
}

export async function getCollegeBySlug(slug: string): Promise<College | undefined> {
  const record = await getCollegeFromRepo(slug);
  return record ? toCollegeShape(record) : undefined;
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function scoreCollegeMatch(college: College, query: string): number {
  const normalized = normalizeText(query);
  if (!normalized) {
    return 0;
  }

  const haystacks = [
    { text: college.name, weight: 50 },
    { text: college.slug, weight: 35 },
    { text: college.district, weight: 18 },
    { text: college.university, weight: 15 },
    { text: college.location, weight: 10 },
    { text: college.branches.join(" "), weight: 12 },
    { text: college.facilities.join(" "), weight: 8 },
    { text: college.description, weight: 4 },
  ];

  let score = 0;

  for (const item of haystacks) {
    const text = normalizeText(item.text);
    if (!text) {
      continue;
    }

    if (text === normalized) {
      score += item.weight + 30;
      continue;
    }

    if (text.startsWith(normalized)) {
      score += item.weight + 18;
      continue;
    }

    if (text.includes(normalized)) {
      score += item.weight;
      continue;
    }

    const queryWords = normalized.split(" ");
    const matchedWords = queryWords.filter((word) => text.includes(word));
    if (matchedWords.length > 0) {
      score += item.weight * (matchedWords.length / queryWords.length) * 0.8;
    }
  }

  return score;
}

export async function searchColleges(query: string): Promise<College[]> {
  const normalized = query.trim();
  const colleges = await getAllColleges();

  if (!normalized) {
    return colleges;
  }

  return colleges
    .map((college) => ({ college, score: scoreCollegeMatch(college, normalized) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.college.name.localeCompare(b.college.name))
    .map((item) => item.college);
}

export async function filterColleges(filters: CollegeFilters): Promise<College[]> {
  const colleges = await getAllColleges();

  return colleges.filter((college) => {
    if (filters.district && college.district.toLowerCase() !== filters.district.toLowerCase()) {
      return false;
    }

    if (filters.naacGrade && college.naacGrade.toLowerCase() !== filters.naacGrade.toLowerCase()) {
      return false;
    }

    if (typeof filters.autonomous === "boolean" && college.autonomous !== filters.autonomous) {
      return false;
    }

    if (filters.branch) {
      const branchMatch = college.branches.some((branch) => branch.toLowerCase() === filters.branch?.toLowerCase());
      if (!branchMatch) {
        return false;
      }
    }

    return true;
  });
}
