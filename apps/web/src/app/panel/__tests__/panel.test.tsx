import { render, screen, waitFor } from '@testing-library/react';
import PanelPage from '../page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

jest.mock('@/services/api', () => ({
  getMyBookings: jest.fn(),
  getProfile: jest.fn(),
  getCompanionAvailability: jest.fn(),
  setMyAvailability: jest.fn(),
  updateBookingStatus: jest.fn(),
  requestCompletion: jest.fn(),
}));

const api = require('@/services/api');

const requestedBooking = {
  id: 'b-1',
  clientId: 'client-1',
  companionId: 'comp-1',
  status: 'REQUESTED',
  serviceType: 'Acompañamiento a compras',
  summary: 'Necesito ayuda con la compra semanal',
  address: 'Calle Mayor 1, Madrid',
  scheduledAt: '2026-12-15T10:00:00.000Z',
  disability: 'Movilidad reducida',
  client: { id: 'client-1', profile: { fullName: 'Juan' } },
};

describe('PanelPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading spinner while data is loading', () => {
    render(<PanelPage />);
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('shows directed REQUESTED solicitudes with accept/reject and a detail link', async () => {
    api.getMyBookings.mockResolvedValue([requestedBooking]);
    api.getProfile.mockResolvedValue({
      id: 'profile-comp',
      companion: { id: 'comp-1', verified: true },
    });
    api.getCompanionAvailability.mockResolvedValue([]);

    render(<PanelPage />);

    await waitFor(() => expect(api.getMyBookings).toHaveBeenCalled());

    expect(screen.getByText('Juan')).toBeInTheDocument();
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Aceptar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Rechazar/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ver detalle/i })).toHaveAttribute(
      'href',
      '/reservas/b-1',
    );
  });

  it('does not render the open marketplace section', async () => {
    api.getMyBookings.mockResolvedValue([]);
    api.getProfile.mockResolvedValue({
      id: 'profile-comp',
      companion: { id: 'comp-1', verified: true },
    });
    api.getCompanionAvailability.mockResolvedValue([]);

    render(<PanelPage />);

    await waitFor(() => expect(api.getMyBookings).toHaveBeenCalled());

    expect(screen.queryByText(/Solicitudes abiertas/i)).not.toBeInTheDocument();
  });
});