import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AvailabilityGrid } from '../availability-grid';

describe('AvailabilityGrid', () => {
  it('renders day headers', () => {
    render(<AvailabilityGrid slots={[]} onChange={jest.fn()} />);
    expect(screen.getByText('Lun')).toBeInTheDocument();
    expect(screen.getByText('Mar')).toBeInTheDocument();
    expect(screen.getByText('Dom')).toBeInTheDocument();
    expect(screen.getByText('Sáb')).toBeInTheDocument();
  });

  it('renders time labels with :00 hours bold', () => {
    render(<AvailabilityGrid slots={[]} onChange={jest.fn()} />);
    expect(screen.getByText('08:00')).toBeInTheDocument();
    expect(screen.getByText('12:00')).toBeInTheDocument();
  });

  it('shows active slot as selected', () => {
    render(
      <AvailabilityGrid
        slots={[{ id: '1', companionId: 'c1', dayOfWeek: 1, startTime: '10:00', endTime: '10:30' }]}
        onChange={jest.fn()}
      />,
    );
    const cells = document.querySelectorAll('[data-cell]');
    const active = Array.from(cells).find(
      (c) => c.getAttribute('data-day') === '1' && c.getAttribute('data-start') === '10:00',
    );
    expect(active).toBeTruthy();
    expect(active!.className).toContain('bg-blue-600');
  });

  it('toggles cell on click and calls onChange', async () => {
    const onChange = jest.fn();
    render(<AvailabilityGrid slots={[]} onChange={onChange} />);

    const cell = document.querySelector('[data-day="1"][data-start="09:00"]') as HTMLElement;
    await userEvent.pointer({ keys: '[MouseLeft]', target: cell });

    expect(onChange).toHaveBeenCalledWith(
      expect.arrayContaining([{ dayOfWeek: 1, startTime: '09:00', endTime: '09:30' }]),
    );
  });
});
