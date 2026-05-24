import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FaqAccordion } from '../faq-accordion';

describe('FaqAccordion', () => {
  const items = [
    { question: 'Como funciona?', answer: 'Es muy facil.' },
    { question: 'Cuanto cuesta?', answer: 'Depende del servicio.' },
  ];

  it('renders all FAQ items', () => {
    render(<FaqAccordion items={items} />);
    expect(screen.getByText('Como funciona?')).toBeInTheDocument();
    expect(screen.getByText('Cuanto cuesta?')).toBeInTheDocument();
  });

  it('opens first item on click', async () => {
    render(<FaqAccordion items={items} />);
    const button = screen.getByText('Como funciona?').closest('button')!;
    expect(button).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes item when clicked again', async () => {
    render(<FaqAccordion items={items} />);
    const button = screen.getByText('Como funciona?').closest('button')!;
    await userEvent.click(button);
    await userEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('only one item open at a time', async () => {
    render(<FaqAccordion items={items} />);
    const firstBtn = screen.getByText('Como funciona?').closest('button')!;
    const secondBtn = screen.getByText('Cuanto cuesta?').closest('button')!;
    await userEvent.click(firstBtn);
    expect(firstBtn).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(secondBtn);
    expect(firstBtn).toHaveAttribute('aria-expanded', 'false');
    expect(secondBtn).toHaveAttribute('aria-expanded', 'true');
  });

  it('renders empty state with no items', () => {
    const { container } = render(<FaqAccordion items={[]} />);
    expect(container.querySelector('.space-y-3')).toBeInTheDocument();
  });
});
