import type { CompanionSummary, CompanionDetail } from '@/types';

export function getCompanionLevel(completedServices: number): { name: string; color: string; emoji: string } {
  if (completedServices >= 20) return { name: 'Oro', color: '#e07b39', emoji: '🥇' };
  if (completedServices >= 5) return { name: 'Plata', color: '#94a3b8', emoji: '🥈' };
  return { name: 'Bronce', color: '#b45309', emoji: '🥉' };
}
