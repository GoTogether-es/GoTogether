import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SupervisionPage from '../page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => () => <div data-testid="map-placeholder">Mapa</div>,
}));

describe('SupervisionPage', () => {
  function renderPage() {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return render(
      <QueryClientProvider client={queryClient}>
        <SupervisionPage />
      </QueryClientProvider>,
    );
  }

  it('renders loading spinner while checking authorization', () => {
    renderPage();
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });
});
