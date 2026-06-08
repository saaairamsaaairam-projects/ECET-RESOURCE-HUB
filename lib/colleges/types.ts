export interface PlacementInfo {
  averagePackage: string;
  highestPackage: string;
  recruiters: string[];
}

export interface FeeStructure {
  tuition: string;
  hostel: string;
  transport?: string;
  other?: string;
}

export interface StudentInsights {
  codingCulture: string;
  attendance: string;
  placementsReality: string;
  hostelReview: string;
  campusLife?: string;
  studentLife?: string;
}

export interface ClosingRanks {
  2023?: number;
  2024?: number;
  2025?: number;
}

export interface EcetBranchData {
  branch: string;
  cutoff2023?: string;
  cutoff2024?: string;
  cutoff2025?: string;
  closingRanks?: ClosingRanks;
}

export interface CollegeStats {
  reviews?: number;
  placementsScore?: number;
  campusScore?: number;
  affordabilityScore?: number;
}

export interface CollegeImages {
  cover: string;
  gallery?: string[];
}

export interface College {
  id: string;
  slug: string;
  name: string;
  images: CollegeImages;
  location: string;
  district: string;
  autonomous: boolean;
  naacGrade: string;
  university: string;
  website: string;
  description: string;
  placements: PlacementInfo;
  fees: FeeStructure;
  facilities: string[];
  branches: string[];
  ecetData: EcetBranchData[];
  ecetCutoffs?: Array<{ branch: string; year: number; closingRank: number }>;
  studentInsights?: StudentInsights;
  verificationStatus?: string;
  lastVerified?: string;
  sourceUrl?: string;
  scores?: {
    academic?: number;
    placement?: number;
    infrastructure?: number;
    hostel?: number;
  };
  stats?: CollegeStats;
}
