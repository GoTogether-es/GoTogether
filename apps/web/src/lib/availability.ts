import type { AvailabilitySlotData } from '@/types';

export type AvailabilityRange = { startTime: string; endTime: string };

/**
 * Agrupa franjas contiguas del mismo día en rangos legibles.
 * Ej.: [08:00–08:30, 08:30–09:00, 09:00–09:30] → ['08:00–09:30'].
 */
export function mergeContiguousRanges(ranges: AvailabilityRange[]): string[] {
  const sorted = [...ranges].sort((a, b) =>
    a.startTime < b.startTime ? -1 : a.startTime > b.startTime ? 1 : 0,
  );
  const merged: AvailabilityRange[] = [];
  for (const r of sorted) {
    const last = merged[merged.length - 1];
    if (last && last.endTime === r.startTime) {
      last.endTime = r.endTime;
    } else {
      merged.push({ ...r });
    }
  }
  return merged.map((m) => `${m.startTime}–${m.endTime}`);
}

export type DayAvailability = { day: number; label: string; times: string[] };

/**
 * Convierte los slots de disponibilidad en una lista ordenada por día,
 * con el nombre del día (según `dayNames`, indexado 0-6) y sus franjas
 * horarias ya fusionadas.
 */
export function formatAvailabilitySlots(
  slots: AvailabilitySlotData[],
  dayNames: readonly string[],
): DayAvailability[] {
  const dayTimes = new Map<number, AvailabilityRange[]>();
  for (const slot of slots) {
    const list = dayTimes.get(slot.dayOfWeek) ?? [];
    list.push({ startTime: slot.startTime, endTime: slot.endTime });
    dayTimes.set(slot.dayOfWeek, list);
  }
  return [...dayTimes.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([day, ranges]) => ({ day, label: dayNames[day], times: mergeContiguousRanges(ranges) }));
}