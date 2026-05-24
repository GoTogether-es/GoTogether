import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReservasPage from '../page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe('ReservasPage', () => {
  function renderPage() {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return render(
      <QueryClientProvider client={queryClient}>
        <ReservasPage />
      </QueryClientProvider>,
    );
  }

  it('renders without crashing', () => {
    renderPage();
    expect(document.querySelector('.gt-section')).toBeInTheDocument();
  });

  it('renders empty state when no bookings', async () => {
    renderPage();

    await screen.findByText('No tienes ninguna reserva aún.');
    expect(screen.getByText('No tienes ninguna reserva aún.')).toBeInTheDocument();
  });
});
