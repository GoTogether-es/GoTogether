import { render, screen } from '@testing-library/react';
import CoordinationPage from '../page';

describe('CoordinationPage', () => {
  it('renders chat heading', () => {
    render(<CoordinationPage />);
    expect(screen.getByRole('heading', { name: /Coordinacion/i })).toBeInTheDocument();
  });
});
