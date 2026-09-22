import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SolicitudPage from '../page';
import * as api from '@/services/api';

const mockRouterPush = jest.fn();
let mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush, replace: jest.fn() }),
  useSearchParams: () => mockSearchParams,
}));

jest.mock('@/services/queries', () => ({
  useServices: jest.fn(),
  useCompanion: jest.fn(),
  useCompanionAvailability: jest.fn(),
  useProfile: jest.fn(),
}));

jest.mock('@/services/api', () => ({
  createBooking: jest.fn(),
  requestBooking: jest.fn(),
}));

const queries = require('@/services/queries');

const mockService = {
  id: 'svc-1',
  name: 'Acompañamiento médico',
  description: 'Acompañamiento a consultas médicas',
  price: 1300,
  category: 'Salud',
  active: true,
};

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <SolicitudPage />
    </QueryClientProvider>,
  );
}

describe('SolicitudPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouterPush.mockClear();
    mockSearchParams = new URLSearchParams();
    queries.useServices.mockReturnValue({ data: [mockService], isLoading: false });
    queries.useCompanion.mockReturnValue({ data: null });
    queries.useCompanionAvailability.mockReturnValue({ data: [] });
    queries.useProfile.mockReturnValue({ data: null });
  });

  it('renders heading', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /Cuéntanos qué necesitas/i })).toBeInTheDocument();
  });

  it('shows an empty state when no services are available and disables submit', () => {
    queries.useServices.mockReturnValue({ data: [], isLoading: false });
    renderPage();

    expect(screen.getByText(/no hay servicios disponibles/i)).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /acompañamiento buscas/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Publicar solicitud/i })).toBeDisabled();
  });

  it('shows the selected companion in the banner with a remove option', () => {
    mockSearchParams = new URLSearchParams({ companionId: 'comp-1' });
    queries.useCompanion.mockReturnValue({
      data: { profile: { fullName: 'Carlos', city: 'Málaga' } },
    });

    renderPage();

    expect(screen.getByText(/Has seleccionado a Carlos · Málaga/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Quitar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Enviar solicitud al acompañante/i })).toBeInTheDocument();
  });

  it('warns when the chosen time is outside the companion availability', () => {
    mockSearchParams = new URLSearchParams({ companionId: 'comp-1' });
    queries.useCompanion.mockReturnValue({ data: { profile: { fullName: 'Carlos', city: 'Málaga' } } });
    const dateStr = '2026-12-07';
    const wrongDay = (new Date(`${dateStr}T10:00:00`).getDay() + 1) % 7;
    queries.useCompanionAvailability.mockReturnValue({
      data: [{ id: 's1', companionId: 'comp-1', dayOfWeek: wrongDay, startTime: '08:00', endTime: '14:00' }],
    });

    renderPage();

    fireEvent.change(screen.getByLabelText(/Fecha prevista/i), { target: { value: dateStr } });
    fireEvent.change(screen.getByLabelText(/Hora de inicio/i), { target: { value: '10:00' } });

    expect(screen.getByText(/Aviso de disponibilidad/i)).toBeInTheDocument();
  });

  it('publishes the booking in a single call with publish: true', async () => {
    (api.createBooking as jest.Mock).mockResolvedValue({ id: 'b-1', status: 'REQUESTED' });

    renderPage();

    fireEvent.change(screen.getByLabelText(/¿Qué tipo de acompañamiento buscas\?/i), {
      target: { value: 'svc-1' },
    });
    fireEvent.change(screen.getByLabelText(/Fecha prevista/i), { target: { value: '2026-12-01' } });
    fireEvent.change(screen.getByLabelText(/Hora de inicio/i), { target: { value: '10:00' } });
    fireEvent.change(screen.getByLabelText(/Dirección o punto de encuentro/i), {
      target: { value: 'Calle Mayor 1, Madrid' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Publicar solicitud/i }));

    await waitFor(() => expect(api.createBooking).toHaveBeenCalledTimes(1));

    expect(api.createBooking).toHaveBeenCalledWith(
      expect.objectContaining({
        serviceId: 'svc-1',
        address: 'Calle Mayor 1, Madrid',
        publish: true,
        estimatedHours: 1,
        companionId: undefined,
      }),
    );
    await waitFor(() => expect(mockRouterPush).toHaveBeenCalledWith('/reservas'));
    expect(api.requestBooking).not.toHaveBeenCalled();
  });

  it('falls back to requestBooking when the API returns a DRAFT booking', async () => {
    (api.createBooking as jest.Mock).mockResolvedValue({ id: 'b-1', status: 'DRAFT' });
    (api.requestBooking as jest.Mock).mockResolvedValue({ id: 'b-1', status: 'REQUESTED' });

    renderPage();

    fireEvent.change(screen.getByLabelText(/¿Qué tipo de acompañamiento buscas\\?/i), {
      target: { value: 'svc-1' },
    });
    fireEvent.change(screen.getByLabelText(/Fecha prevista/i), { target: { value: '2026-12-01' } });
    fireEvent.change(screen.getByLabelText(/Hora de inicio/i), { target: { value: '10:00' } });
    fireEvent.change(screen.getByLabelText(/Dirección o punto de encuentro/i), {
      target: { value: 'Calle Mayor 1, Madrid' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Publicar solicitud/i }));

    await waitFor(() => expect(api.requestBooking).toHaveBeenCalledWith('b-1'));
    await waitFor(() => expect(mockRouterPush).toHaveBeenCalledWith('/reservas'));
  });
});