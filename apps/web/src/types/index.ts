export type HomeStep = {
  title: string;
  copy: string;
};

export type CompanionSummary = {
  id: string;
  name: string;
  bio: string;
  specialties: string;
  rating: number;
  yearsOnPlatform: number;
  verified: boolean;
  image?: string;
  alt?: string;
};

export type CompanionDetail = {
  id: string;
  profile: {
    fullName: string;
    headline: string | null;
    bio: string | null;
    phone: string | null;
    avatarUrl: string | null;
    disabilityType: string | null;
    preferences: string | null;
  };
  specialties: string | null;
  verified: boolean;
  backgroundCheck: string | null;
  rating: number;
  yearsOnPlatform: number;
  completedServices: number;
  averageRating: number | null;
  recentRatings: number[];
};
