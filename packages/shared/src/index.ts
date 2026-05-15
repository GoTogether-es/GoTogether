export type UserRole = 'CLIENT' | 'COMPANION' | 'ADMIN';

export type BookingStatus =
  | 'DRAFT'
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export const DISABILITY_TYPES = [
  'REDUCED_MOBILITY',
  'VISUAL_IMPAIRMENT',
  'HEARING_IMPAIRMENT',
  'COGNITIVE_IMPAIRMENT',
  'OTHER',
] as const;

export type DisabilityType = (typeof DISABILITY_TYPES)[number];
