import { getCompanionLevel } from '@/lib/levels';

describe('getCompanionLevel', () => {
  it('returns Bronce for 0 completed services', () => {
    expect(getCompanionLevel(0)).toEqual({ name: 'Bronce', color: '#b45309', emoji: '🥉' });
  });

  it('returns Bronce for 4 completed services', () => {
    expect(getCompanionLevel(4)).toEqual({ name: 'Bronce', color: '#b45309', emoji: '🥉' });
  });

  it('returns Plata for 5 completed services', () => {
    expect(getCompanionLevel(5)).toEqual({ name: 'Plata', color: '#94a3b8', emoji: '🥈' });
  });

  it('returns Plata for 19 completed services', () => {
    expect(getCompanionLevel(19)).toEqual({ name: 'Plata', color: '#94a3b8', emoji: '🥈' });
  });

  it('returns Oro for 20 completed services', () => {
    expect(getCompanionLevel(20)).toEqual({ name: 'Oro', color: '#e07b39', emoji: '🥇' });
  });

  it('returns Oro for 100 completed services', () => {
    expect(getCompanionLevel(100)).toEqual({ name: 'Oro', color: '#e07b39', emoji: '🥇' });
  });
});
