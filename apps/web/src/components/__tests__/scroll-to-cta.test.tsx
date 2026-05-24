import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScrollToCta } from '../scroll-to-cta';

describe('ScrollToCta', () => {
  it('renders button with children', () => {
    render(<ScrollToCta>Ir al CTA</ScrollToCta>);
    expect(screen.getByText('Ir al CTA')).toBeInTheDocument();
  });

  it('has button type button', () => {
    render(<ScrollToCta>Click</ScrollToCta>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('scrolls to #final-cta on click', async () => {
    const scrollIntoView = jest.fn();
    const element = { scrollIntoView };
    jest.spyOn(document, 'getElementById').mockReturnValue(element as any);

    render(<ScrollToCta>Scroll</ScrollToCta>);
    await userEvent.click(screen.getByText('Scroll'));

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('applies variant classes', () => {
    render(<ScrollToCta variant="secondary">Secondary</ScrollToCta>);
    const btn = screen.getByText('Secondary');
    expect(btn.className).toContain('gt-button--secondary');
  });

  it('applies custom className', () => {
    render(<ScrollToCta className="my-custom">Custom</ScrollToCta>);
    expect(screen.getByText('Custom').className).toContain('my-custom');
  });
});
