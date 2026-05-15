import { render, screen } from '@testing-library/react';
import SolicitudPage from '../page';

describe('SolicitudPage', () => {
  it('renders heading', () => {
    render(<SolicitudPage />);
    expect(screen.getByRole('heading', { name: /Cuéntanos qué necesitas/i })).toBeInTheDocument();
  });
});
