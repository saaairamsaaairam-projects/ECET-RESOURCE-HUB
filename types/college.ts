export interface CollegeRecord {
  id: string;
  slug: string;
  name: string;
  location: string;
  district: string;
  university: string;
  naac_grade: string;
  website?: string | null;
  description?: string | null;
  cover_image_url?: string | null;
  gallery_images?: string[];
  placements?: {
    averagePackage?: string;
    highestPackage?: string;
    recruiters?: string[];
  };
  fees?: {
    tuition?: string;
    hostel?: string;
    transport?: string;
    other?: string;
  };
  student_insights?: {
    codingCulture?: string;
    attendance?: string;
    placementReality?: string;
    hostelReview?: string;
    campusLife?: string;
    studentLife?: string;
  };
  facilities?: string[];
  branches?: string[];
  autonomous?: boolean;
  ecet_cutoffs?: Array<{ branch: string; year: number; closing_rank: number }>;
  verification_status?: string;
  last_verified?: string | null;
  source_url?: string | null;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCollegeInput {
  name: string;
  slug: string;
  location: string;
  district: string;
  university: string;
  naac_grade: string;
  website?: string;
  description?: string;
  status?: "draft" | "published" | "archived";
  branches?: string[];
  placements?: {
    averagePackage?: string;
    highestPackage?: string;
    recruiters?: string[];
  };
  fees?: {
    tuition?: string;
    hostel?: string;
    transport?: string;
    other?: string;
  };
  cover_image_url?: string | null;
  gallery_images?: string[];
  facilities?: string[];
  verification_status?: string;
  last_verified?: string | null;
  source_url?: string | null;
  student_insights?: {
    codingCulture?: string;
    attendance?: string;
    placementReality?: string;
    hostelReview?: string;
    campusLife?: string;
    studentLife?: string;
  };
}

export interface UpdateCollegeInput {
  name?: string;
  slug?: string;
  location?: string;
  district?: string;
  university?: string;
  naac_grade?: string;
  website?: string | null;
  description?: string | null;
  status?: "draft" | "published" | "archived";
  branches?: string[];
  placements?: {
    averagePackage?: string;
    highestPackage?: string;
    recruiters?: string[];
  } | null;
  fees?: {
    tuition?: string;
    hostel?: string;
    transport?: string;
    other?: string;
  } | null;
  cover_image_url?: string | null;
  gallery_images?: string[] | null;
  facilities?: string[] | null;
  verification_status?: string;
  last_verified?: string | null;
  source_url?: string | null;
  student_insights?: {
    codingCulture?: string;
    attendance?: string;
    placementReality?: string;
    hostelReview?: string;
    campusLife?: string;
    studentLife?: string;
  } | null;
  autonomous?: boolean;
}
