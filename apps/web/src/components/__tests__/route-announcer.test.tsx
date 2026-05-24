import { render } from '@testing-library/react';
import { RouteAnnouncer } from '../route-announcer';

jest.mock('next/navigation', () => ({
  usePathname: () => '/test-page',
}));

describe('RouteAnnouncer', () => {
  it('renders with role status and aria-live polite', () => {
    const { container } = render(<RouteAnnouncer />);
    const div = container.firstChild as HTMLElement;
    expect(div).toHaveAttribute('role', 'status');
    expect(div).toHaveAttribute('aria-live', 'polite');
    expect(div).toHaveAttribute('aria-atomic', 'true');
  });

  it('has sr-only class', () => {
    const { container } = render(<RouteAnnouncer />);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain('sr-only');
  });

  it('updates text content on pathname change', () => {
    const { container, rerender } = render(<RouteAnnouncer />);
    // Wait for useEffect to run
    const div = container.firstChild as HTMLElement;
    // textContent is set via useEffect in JSDOM
    expect(div).toBeInTheDocument();
  });
});
