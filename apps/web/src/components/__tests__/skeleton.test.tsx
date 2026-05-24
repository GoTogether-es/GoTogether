import { render, screen } from '@testing-library/react';
import { SkeletonText, SkeletonCard, SkeletonChat, SkeletonForm, SkeletonPage, SkeletonAvatar, SkeletonBookingCard } from '../skeleton';

describe('Skeleton components', () => {
  describe('SkeletonText', () => {
    it('renders with default width and height', () => {
      const { container } = render(<SkeletonText />);
      const div = container.firstChild as HTMLElement;
      expect(div).toHaveClass('animate-pulse');
      expect(div).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders with custom dimensions', () => {
      const { container } = render(<SkeletonText width="50%" height="2rem" />);
      const div = container.firstChild as HTMLElement;
      expect(div).toBeInTheDocument();
    });
  });

  describe('SkeletonAvatar', () => {
    it('renders circular div', () => {
      const { container } = render(<SkeletonAvatar />);
      const div = container.firstChild as HTMLElement;
      expect(div).toHaveClass('rounded-full');
      expect(div).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('SkeletonCard', () => {
    it('renders card shape', () => {
      const { container } = render(<SkeletonCard />);
      expect(container.firstChild).toBeInTheDocument();
      // Contains pulsing sub-elements
      expect(container.querySelectorAll('[aria-hidden]').length).toBeGreaterThan(0);
    });
  });

  describe('SkeletonBookingCard', () => {
    it('renders booking card shape', () => {
      const { container } = render(<SkeletonBookingCard />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('SkeletonChat', () => {
    it('renders alternating chat bubbles', () => {
      const { container } = render(<SkeletonChat />);
      expect(container.firstChild).toBeInTheDocument();
      const avatars = container.querySelectorAll('.rounded-full');
      expect(avatars.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('SkeletonForm', () => {
    it('renders form grid', () => {
      const { container } = render(<SkeletonForm />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('SkeletonPage', () => {
    it('renders children inside page structure', () => {
      render(<SkeletonPage><span data-testid="child">Content</span></SkeletonPage>);
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });
  });
});
