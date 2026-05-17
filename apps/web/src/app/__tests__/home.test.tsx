import { render, screen } from '@testing-library/react';
import HomePage from '../page';

describe('HomePage', () => {
  it('renders hero heading', () => {
    render(<HomePage />);
    expect(
      screen.getByRole('heading', {
        name: /Acompañamiento humano para vivir con más autonomía/i,
      }),
    ).toBeInTheDocument();
  });
});
