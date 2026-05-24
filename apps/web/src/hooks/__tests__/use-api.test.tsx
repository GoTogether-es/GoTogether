import { renderHook, waitFor } from '@testing-library/react';
import { useApiHealth } from '@/hooks/use-api';

jest.mock('@/services/api', () => ({
  __esModule: true,
  getHealth: jest.fn(),
  requestMagicLink: jest.fn(),
  logout: jest.fn(),
  getProfile: jest.fn(),
  upsertProfile: jest.fn(),
  createBooking: jest.fn(),
  requestBooking: jest.fn(),
  getMyBookings: jest.fn(),
  getBooking: jest.fn(),
  updateBookingStatus: jest.fn(),
  getCompanions: jest.fn(),
  getCompanionById: jest.fn(),
  getRecommendations: jest.fn(),
  getChatRoom: jest.fn(),
  getAccessToken: jest.fn(),
  createReport: jest.fn(),
  getReportByBooking: jest.fn(),
  getSupervisorBookings: jest.fn(),
  createSupervision: jest.fn(),
  getMyClients: jest.fn(),
  getMySupervisor: jest.fn(),
  removeSupervision: jest.fn(),
  searchUsers: jest.fn(),
  getServices: jest.fn(),
  getPendingInvites: jest.fn(),
  getBookingStats: jest.fn(),
  getOpenBookings: jest.fn(),
  getCompanionAvailability: jest.fn(),
  setMyAvailability: jest.fn(),
  getNotifications: jest.fn(),
  getUnreadCount: jest.fn(),
  markNotificationRead: jest.fn(),
  markAllNotificationsRead: jest.fn(),
  getBookingHistory: jest.fn(),
  sendChatMessage: jest.fn(),
  inviteSupervision: jest.fn(),
  acceptInvitation: jest.fn(),
  cancelInvitation: jest.fn(),
  syncUser: jest.fn(),
}));

import { getHealth } from '@/services/api';

describe('useApiHealth', () => {
  it('transitions to ok on successful health check', async () => {
    (getHealth as jest.Mock).mockResolvedValue({ status: 'ok' });

    const { result } = renderHook(() => useApiHealth());

    expect(result.current).toBe('idle');

    await waitFor(() => {
      expect(result.current).toBe('ok');
    });
  });

  it('transitions to error on failed health check', async () => {
    (getHealth as jest.Mock).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useApiHealth());

    await waitFor(() => {
      expect(result.current).toBe('error');
    });
  });
});
