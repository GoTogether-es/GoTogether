import { render, screen } from '@testing-library/react';
import CoordinationPage from '../page';

describe('CoordinationPage', () => {
  it('redirects to reservas', () => {
    render(<CoordinationPage />);
    expect(screen.getByText(/Redirigiendo a tus reservas/i)).toBeInTheDocument();
  });
});
