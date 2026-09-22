import { mergeContiguousRanges, formatAvailabilitySlots } from '../availability';
import { DAY_NAMES_FULL } from '../constants';
import type { AvailabilitySlotData } from '@/types';

const slot = (dayOfWeek: number, startTime: string, endTime: string): AvailabilitySlotData => ({
  id: `slot-${dayOfWeek}-${startTime}`,
  companionId: 'comp-1',
  dayOfWeek,
  startTime,
  endTime,
});

describe('mergeContiguousRanges', () => {
  it('merges contiguous half-hour slots into a single range', () => {
    const ranges = [
      { startTime: '08:30', endTime: '09:00' },
      { startTime: '08:00', endTime: '08:30' },
      { startTime: '09:00', endTime: '09:30' },
    ];
    expect(mergeContiguousRanges(ranges)).toEqual(['08:00–09:30']);
  });

  it('does not merge ranges with a gap', () => {
    const ranges = [
      { startTime: '08:00', endTime: '09:00' },
      { startTime: '10:00', endTime: '11:00' },
    ];
    expect(mergeContiguousRanges(ranges)).toEqual(['08:00–09:00', '10:00–11:00']);
  });

  it('returns empty array for no ranges', () => {
    expect(mergeContiguousRanges([])).toEqual([]);
  });

  it('does not mutate the input', () => {
    const ranges = [
      { startTime: '09:00', endTime: '10:00' },
      { startTime: '08:00', endTime: '09:00' },
    ];
    mergeContiguousRanges(ranges);
    expect(ranges[0].startTime).toBe('09:00');
  });
});

describe('formatAvailabilitySlots', () => {
  it('groups by day, sorts and merges times', () => {
    const manyNames = [...DAY_NAMES_FULL, 'Extra1', 'Extra2', 'Extra3'];
    const slots = [
      slot(6, '13:30', '14:00'),
      slot(6, '08:00', '08:30'),
      slot(6, '08:30', '09:00'),
      slot(0, '09:00', '09:30'),
      slot(0, '08:00', '08:30'),
      slot(0, '08:30', '09:00'),
      slot(9, '10:00', '11:00'),
    ];
    const result = formatAvailabilitySlots(slots, manyNames);
    expect(result).toEqual([
      { day: 0, label: 'Domingo', times: ['08:00–09:30'] },
      { day: 6, label: 'Sábado', times: ['08:00–09:00', '13:30–14:00'] },
      { day: 9, label: 'Extra3', times: ['10:00–11:00'] },
    ]);
  });

  it('returns empty array when there are no slots', () => {
    expect(formatAvailabilitySlots([], DAY_NAMES_FULL)).toEqual([]);
  });
});