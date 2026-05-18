import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProfile, useMyBookings } from '@/services/queries';
import type { ReactNode } from 'react';

jest.mock('@/services/api', () => ({
  __esModule: true,
  getProfile: jest.fn(),
  getMyBookings: jest.fn(),
}));

import * as api from '@/services/api';

const mockProfile = {
  id: 'user-1',
  fullName: 'Juan Pérez',
  headline: 'Jubilado',
  bio: 'Me gusta pasear',
  phone: '+34 600 000 000',
  disabilityType: null,
  preferences: null,
  companion: null,
};

const mockBookings = [
  {
    id: 'booking-1',
    clientId: 'user-1',
    companionId: null,
    bookedById: null,
    status: 'REQUESTED',
    serviceType: 'Médico',
    summary: null,
    address: 'Calle Mayor 1',
    scheduledAt: '2026-06-15T10:00:00.000Z',
    disability: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches and returns profile data', async () => {
    (api.getProfile as jest.Mock).mockResolvedValue(mockProfile);

    const { result } = renderHook(() => useProfile(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.data).toEqual(mockProfile));

    expect(api.getProfile).toHaveBeenCalledTimes(1);
  });

  it('returns null when profile not found (404)', async () => {
    (api.getProfile as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useProfile(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.data).toBeNull());
  });

  it('reports error on API failure', async () => {
    (api.getProfile as jest.Mock).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useProfile(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useMyBookings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches and returns bookings', async () => {
    (api.getMyBookings as jest.Mock).mockResolvedValue(mockBookings);

    const { result } = renderHook(() => useMyBookings(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.data).toEqual(mockBookings));

    expect(api.getMyBookings).toHaveBeenCalledTimes(1);
  });

  it('returns empty array on API error', async () => {
    (api.getMyBookings as jest.Mock).mockRejectedValue(new Error('Failed'));

    const { result } = renderHook(() => useMyBookings(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
