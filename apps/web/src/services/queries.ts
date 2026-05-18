import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './api';

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: api.getProfile,
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
    queryFn: api.getCompanions,
  });
}

export function useCompanion(id: string) {
  return useQuery({
    queryKey: ['companion', id],
    queryFn: () => api.getCompanionById(id),
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
    queryFn: () => api.getRecommendations(params),
    placeholderData: (prev) => prev,
  });
}

export function useMyBookings() {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: api.getMyBookings,
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => api.getBooking(id),
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
    queryFn: () => api.getChatRoom(bookingId),
    enabled: !!bookingId,
  });
}

export function useReportByBooking(bookingId: string) {
  return useQuery({
    queryKey: ['report', bookingId],
    queryFn: () => api.getReportByBooking(bookingId),
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
    queryFn: api.getMyClients,
  });
}

export function useMySupervisor() {
  return useQuery({
    queryKey: ['supervision', 'supervisor'],
    queryFn: api.getMySupervisor,
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
    queryFn: () => api.searchUsers(query),
    enabled: query.length >= 2,
    staleTime: 10 * 1000,
  });
}
