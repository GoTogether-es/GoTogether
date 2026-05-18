export type HomeStep = {
  title: string;
  copy: string;
};

export type CompanionSummary = {
  id: string;
  profile: {
    fullName: string;
    headline?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
  };
  specialties: string | null;
  rating: number;
  yearsOnPlatform: number;
  verified: boolean;
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

export type UserProfile = {
  id: string;
  fullName: string | null;
  headline: string | null;
  bio: string | null;
  phone: string | null;
  disabilityType: string | null;
  preferences: string | null;
  companion?: CompanionProfileData | null;
};

export type CompanionProfileData = {
  specialties: string | null;
  verified: boolean;
  backgroundCheck: string | null;
  rating: number;
  yearsOnPlatform: number;
};

export type BookingData = {
  id: string;
  clientId: string;
  companionId: string | null;
  bookedById: string | null;
  status: BookingStatus;
  serviceType: string;
  summary: string | null;
  address: string;
  scheduledAt: string;
  disability: string | null;
  createdAt: string;
  updatedAt: string;
  client?: { id: string; profile?: { fullName: string } };
  companion?: { profile?: { fullName: string } };
  payment?: PaymentData | null;
  chatRoom?: { id: string } | null;
  report?: { id: string } | null;
};

export type BookingStatus =
  | 'DRAFT'
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentData = {
  id: string;
  bookingId: string;
  stripePaymentId: string | null;
  amount: number;
  fee: number;
  currency: string;
  status: string;
};

export type ChatRoomData = {
  id: string;
  bookingId: string;
  messages: ChatMessageData[];
  room: { id: string };
};

export type ChatMessageData = {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  createdAt: string;
};

export type ReportData = {
  id: string;
  bookingId: string;
  rating: number;
  summary: string | null;
};

export type SupervisionData = {
  id: string;
  supervisorId: string;
  clientId: string;
  client?: {
    id: string;
    email: string;
    profile?: { fullName: string } | null;
  };
};

export type SupervisorData = {
  id: string;
  supervisorId: string;
  clientId: string;
  supervisor?: {
    id: string;
    email: string;
    profile?: { fullName: string } | null;
  };
} | null;

export type UserSearchResult = {
  id: string;
  email: string;
  profile?: { fullName: string } | null;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type HealthStatus = {
  status: string;
};
