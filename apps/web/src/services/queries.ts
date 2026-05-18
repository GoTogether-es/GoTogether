import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './api';

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: ({ signal }) => api.getProfile({ signal }),
  });
}

export function useUpsertProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.upsertProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useCompanions() {
  return useQuery({
    queryKey: ['companions'],
    queryFn: ({ signal }) => api.getCompanions({ signal }),
  });
}

export function useCompanion(id: string) {
  return useQuery({
    queryKey: ['companion', id],
    queryFn: ({ signal }) => api.getCompanionById(id, { signal }),
    enabled: !!id,
  });
}

export function useRecommendations(params: {
  search?: string;
  disabilityType?: string;
  verified?: boolean;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['recommendations', params],
    queryFn: ({ signal }) => api.getRecommendations(params, { signal }),
    placeholderData: (prev) => prev,
  });
}

export function useMyBookings() {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: ({ signal }) => api.getMyBookings({ signal }),
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: ({ signal }) => api.getBooking(id, { signal }),
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useRequestBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.requestBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useChatRoom(bookingId: string) {
  return useQuery({
    queryKey: ['chatRoom', bookingId],
    queryFn: ({ signal }) => api.getChatRoom(bookingId, { signal }),
    enabled: !!bookingId,
  });
}

export function useReportByBooking(bookingId: string) {
  return useQuery({
    queryKey: ['report', bookingId],
    queryFn: ({ signal }) => api.getReportByBooking(bookingId, { signal }),
    enabled: !!bookingId,
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, data }: { bookingId: string; data: { rating: number; summary?: string } }) =>
      api.createReport(bookingId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['report', variables.bookingId] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useMyClients() {
  return useQuery({
    queryKey: ['supervision', 'clients'],
    queryFn: ({ signal }) => api.getMyClients({ signal }),
  });
}

export function useMySupervisor() {
  return useQuery({
    queryKey: ['supervision', 'supervisor'],
    queryFn: ({ signal }) => api.getMySupervisor({ signal }),
  });
}

export function useCreateSupervision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createSupervision,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supervision'] });
    },
  });
}

export function useRemoveSupervision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.removeSupervision,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supervision'] });
    },
  });
}

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ['users', 'search', query],
    queryFn: ({ signal }) => api.searchUsers(query, { signal }),
    enabled: query.length >= 2,
    staleTime: 10 * 1000,
  });
}
