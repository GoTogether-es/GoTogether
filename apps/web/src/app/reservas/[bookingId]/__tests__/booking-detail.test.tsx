import { render, screen, waitFor } from '@testing-library/react';
import BookingDetailPage from '../page';

jest.mock('next/navigation', () => ({
  useParams: () => ({ bookingId: 'b-1' }),
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

jest.mock('@/services/queries', () => ({
  useBooking: jest.fn(),
  useProfile: jest.fn(),
}));

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: { user: { id: 'client-1' } } },
      }),
    },
  }),
}));

jest.mock('@/services/api', () => ({
  updateBookingStatus: jest.fn(),
  requestCompletion: jest.fn(),
  completeByClient: jest.fn(),
}));

const queries = require('@/services/queries');

const baseBooking = {
  id: 'b-1',
  clientId: 'client-1',
  companionId: 'comp-1',
  bookedById: 'client-1',
  serviceId: 'svc-1',
  status: 'REQUESTED',
  serviceType: 'Acompañamiento a compras',
  summary: 'Necesito ayuda con la compra semanal',
  address: 'Calle Mayor 1, Madrid',
  scheduledAt: '2026-12-15T10:00:00.000Z',
  disability: 'Movilidad reducida',
  estimatedHours: 2,
  client: { id: 'client-1', profile: { fullName: 'Juan' } },
  companion: { profile: { fullName: 'Carlos' } },
  service: { id: 'svc-1', name: 'Acompañamiento a compras', price: 1300 },
};

function mockQueries(booking: typeof baseBooking, profile: unknown) {
  queries.useBooking.mockReturnValue({
    data: booking,
    isLoading: false,
    isError: false,
    refetch: jest.fn().mockResolvedValue(undefined),
  });
  queries.useProfile.mockReturnValue({ data: profile });
}

describe('BookingDetailPage', () => {
  it('shows the request details and accept/reject for the assigned companion', async () => {
    mockQueries(baseBooking, { companion: { id: 'comp-1' } });

    render(<BookingDetailPage />);

    await waitFor(() =>
      expect(screen.getAllByText(/Acompañamiento a compras/i).length).toBeGreaterThan(0),
    );

    expect(screen.getByText(/Pendiente de aceptación/i)).toBeInTheDocument();
    expect(screen.getByText(/Calle Mayor 1, Madrid/i)).toBeInTheDocument();
    expect(screen.getByText(/Movilidad reducida/i)).toBeInTheDocument();
    expect(screen.getByText(/Necesito ayuda con la compra semanal/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Aceptar solicitud/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Rechazar/i })).toBeInTheDocument();
  });

  it('hides accept/reject for a client and shows review link on a completed no-report booking', async () => {
    mockQueries(
      { ...baseBooking, status: 'COMPLETED', companionId: 'comp-1' },
      { companion: null },
    );

    render(<BookingDetailPage />);

    await waitFor(() => expect(screen.getByText(/Completada/i)).toBeInTheDocument());

    expect(screen.getByRole('link', { name: /Valorar servicio/i })).toHaveAttribute(
      'href',
      '/valoracion/b-1',
    );
    expect(screen.queryByRole('button', { name: /Aceptar solicitud/i })).not.toBeInTheDocument();
  });

  it('shows the chat and complete buttons for a client on an in-progress booking', async () => {
    mockQueries(
      { ...baseBooking, status: 'IN_PROGRESS', companionId: 'comp-1' },
      { companion: null },
    );

    render(<BookingDetailPage />);

    await waitFor(() => expect(screen.getByText(/En curso/i)).toBeInTheDocument());

    expect(screen.getByRole('link', { name: /Chat/i })).toHaveAttribute(
      'href',
      '/coordinacion/b-1',
    );
    expect(screen.getByRole('button', { name: /Confirmar finalización/i })).toBeInTheDocument();
  });
});