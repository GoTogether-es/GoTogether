import { render, screen, fireEvent } from '@testing-library/react';
import { AvailabilityGrid } from '../availability-grid';

describe('AvailabilityGrid', () => {
  it('renders day headers', () => {
    render(<AvailabilityGrid slots={[]} onChange={jest.fn()} />);
    expect(screen.getByText('Lun')).toBeInTheDocument();
    expect(screen.getByText('Mar')).toBeInTheDocument();
    expect(screen.getByText('Dom')).toBeInTheDocument();
    expect(screen.getByText('Sáb')).toBeInTheDocument();
  });

  it('renders time labels', () => {
    render(<AvailabilityGrid slots={[]} onChange={jest.fn()} />);
    expect(screen.getByText('08:00')).toBeInTheDocument();
    expect(screen.getByText('12:00')).toBeInTheDocument();
  });

  it('shows active slot as blue', () => {
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

  it('renders inactive slots as gray', () => {
    render(
      <AvailabilityGrid
        slots={[{ id: '1', companionId: 'c1', dayOfWeek: 1, startTime: '10:00', endTime: '10:30' }]}
        onChange={jest.fn()}
      />,
    );
    const cells = document.querySelectorAll('[data-cell]');
    const inactive = Array.from(cells).find(
      (c) => c.getAttribute('data-day') === '1' && c.getAttribute('data-start') === '09:00',
    );
    expect(inactive).toBeTruthy();
    expect(inactive!.className).toContain('bg-gray-50');
  });

  it('toggles slot on pointer down and calls onChange once', () => {
    const onChange = jest.fn();
    render(<AvailabilityGrid slots={[]} onChange={onChange} />);

    const cell = document.querySelector('[data-day="1"][data-start="09:00"]') as HTMLElement;
    fireEvent.pointerDown(cell);
    fireEvent.pointerUp(document);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      expect.arrayContaining([{ dayOfWeek: 1, startTime: '09:00', endTime: '09:30' }]),
    );
  });

  it('day header toggles all slots for that day', () => {
    const onChange = jest.fn();
    render(<AvailabilityGrid slots={[]} onChange={onChange} />);

    const header = screen.getByText('Lun');
    header.click();

    expect(onChange).toHaveBeenCalledTimes(1);
    const call = onChange.mock.calls[0][0];
    expect(call.length).toBe(24);
    expect(call.every((s: any) => s.dayOfWeek === 1)).toBe(true);
  });
});
