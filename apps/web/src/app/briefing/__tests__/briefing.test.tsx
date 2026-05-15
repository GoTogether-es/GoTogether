import { render, screen } from '@testing-library/react';
import BriefingPage from '../page';

describe('BriefingPage', () => {
  it('renders form title', () => {
    render(<BriefingPage />);
    expect(screen.getByRole('heading', { name: /Briefing inicial/i })).toBeInTheDocument();
  });
});
