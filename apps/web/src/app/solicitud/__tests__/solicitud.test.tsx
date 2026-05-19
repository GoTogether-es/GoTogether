import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SolicitudPage from '../page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe('SolicitudPage', () => {
  it('renders heading', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <SolicitudPage />
      </QueryClientProvider>,
    );
    expect(screen.getByRole('heading', { name: /Cuéntanos qué necesitas/i })).toBeInTheDocument();
  });
});
