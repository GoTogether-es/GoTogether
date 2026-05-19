import '@testing-library/jest-dom';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, fill, className, sizes, unoptimized, ...props }: Record<string, unknown>) => {
    const style = fill
      ? { objectFit: 'cover', position: 'absolute', height: '100%', width: '100%', inset: 0 }
      : {};
    return (
      <img
        src={src as string}
        alt={alt as string}
        className={className as string}
        style={style}
        data-testid="next-image"
        data-fill={fill ? 'true' : undefined}
        data-sizes={sizes as string}
        {...props}
      />
    );
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

jest.mock('@/lib/supabase/middleware', () => ({
  updateSession: jest.fn(() => Promise.resolve(new Response())),
}));

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(() =>
        Promise.resolve({ data: { session: null }, error: null }),
      ),
      getUser: jest.fn(() =>
        Promise.resolve({ data: { user: null }, error: null }),
      ),
      exchangeCodeForSession: jest.fn(),
    },
  })),
}));

jest.mock('@/services/api', () => ({
  __esModule: true,
  requestMagicLink: jest.fn(),
  logout: jest.fn(),
  getProfile: jest.fn(() => Promise.resolve(null)),
  upsertProfile: jest.fn(),
  createBooking: jest.fn(),
  requestBooking: jest.fn(),
  getMyBookings: jest.fn(() => Promise.resolve([])),
  getBooking: jest.fn(() => Promise.resolve(null)),
  updateBookingStatus: jest.fn(),
  getCompanions: jest.fn(() => Promise.resolve([])),
  getCompanionById: jest.fn(() => Promise.resolve(null)),
  getRecommendations: jest.fn(() => Promise.resolve({ data: [], meta: { total: 0, page: 1, limit: 9, totalPages: 0 } })),
  getChatRoom: jest.fn(),
  getAccessToken: jest.fn(),
  createReport: jest.fn(),
  getReportByBooking: jest.fn(),
  getHealth: jest.fn(),
  createSupervision: jest.fn(),
  getMyClients: jest.fn(() => Promise.resolve([])),
  getMySupervisor: jest.fn(() => Promise.resolve(null)),
  removeSupervision: jest.fn(),
  searchUsers: jest.fn(() => Promise.resolve([])),
  getServices: jest.fn(() => Promise.resolve([])),
  getPendingInvites: jest.fn(() => Promise.resolve([])),
  getBookingStats: jest.fn(() => Promise.resolve({})),
  getOpenBookings: jest.fn(() => Promise.resolve([])),
  getCompanionAvailability: jest.fn(() => Promise.resolve([])),
  setMyAvailability: jest.fn(),
  getNotifications: jest.fn(() => Promise.resolve([])),
  getUnreadCount: jest.fn(() => Promise.resolve(0)),
  markNotificationRead: jest.fn(),
  markAllNotificationsRead: jest.fn(),
  getBookingHistory: jest.fn(() => Promise.resolve({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } })),
  sendChatMessage: jest.fn(),
  inviteSupervision: jest.fn(),
  acceptInvitation: jest.fn(),
  cancelInvitation: jest.fn(),
  syncUser: jest.fn(),
}));

global.fetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  })),
});

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  })),
});
