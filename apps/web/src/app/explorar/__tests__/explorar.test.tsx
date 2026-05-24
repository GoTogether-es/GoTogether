import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ExplorarPage from '../page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe('ExplorarPage', () => {
  function renderPage() {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return render(
      <QueryClientProvider client={queryClient}>
        <ExplorarPage />
      </QueryClientProvider>,
    );
  }

  it('renders search page heading', () => {
    renderPage();
    expect(screen.getByText('Encuentra a tu acompañante ideal')).toBeInTheDocument();
  });

  it('renders search input', () => {
    renderPage();
    expect(screen.getByPlaceholderText('Buscar por nombre, especialidad...')).toBeInTheDocument();
  });

  it('renders filters toggle button', () => {
    renderPage();
    expect(screen.getByText('Filtros')).toBeInTheDocument();
  });
});
