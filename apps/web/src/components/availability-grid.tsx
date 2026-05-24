'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { AvailabilitySlotData } from '@/types';

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function generateHalfHourSlots(): { start: string; end: string; label: string }[] {
  const slots: { start: string; end: string; label: string }[] = [];
  for (let h = 8; h < 20; h++) {
    for (const m of [0, 30]) {
      const start = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const endH = m === 30 ? h + 1 : h;
      const endM = m === 30 ? '00' : '30';
      const end = `${String(endH).padStart(2, '0')}:${endM}`;
      slots.push({ start, end, label: `${start}` });
    }
  }
  return slots;
}

const HALF_HOUR_SLOTS = generateHalfHourSlots();

type SlotEntry = { dayOfWeek: number; startTime: string; endTime: string };

function cloneSlots(slots: AvailabilitySlotData[]): SlotEntry[] {
  return slots.map((s) => ({ dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime }));
}

interface AvailabilityGridProps {
  slots: AvailabilitySlotData[];
  onChange: (newSlots: { dayOfWeek: number; startTime: string; endTime: string }[]) => void;
  disabled?: boolean;
}

export function AvailabilityGrid({ slots, onChange, disabled }: AvailabilityGridProps) {
  const [renderVer, setRenderVer] = useState(0);
  const slotsRef = useRef<SlotEntry[]>(cloneSlots(slots));
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'add' | 'remove' | null>(null);
  const touchedRef = useRef<Set<string>>(new Set());
  const gridRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    slotsRef.current = cloneSlots(slots);
    setRenderVer((v) => v + 1);
  }, [slots]);

  const isActive = useCallback(
    (dayOfWeek: number, startTime: string, endTime: string) =>
      slotsRef.current.some(
        (s) => s.dayOfWeek === dayOfWeek && s.startTime === startTime && s.endTime === endTime,
      ),
    // renderVer makes this rebuild when ref changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [renderVer],
  );

  const getCellKey = (day: number, start: string, end: string) => `${day}-${start}-${end}`;

  const handlePointerDown = useCallback(
    (dayOfWeek: number, slot: { start: string; end: string }) => {
      if (disabled) return;

      const active = isActive(dayOfWeek, slot.start, slot.end);
      const mode: 'add' | 'remove' = active ? 'remove' : 'add';
      setDragMode(mode);
      setIsDragging(true);
      touchedRef.current = new Set([getCellKey(dayOfWeek, slot.start, slot.end)]);

      if (mode === 'remove') {
        slotsRef.current = slotsRef.current.filter(
          (s) => !(s.dayOfWeek === dayOfWeek && s.startTime === slot.start && s.endTime === slot.end),
        );
      } else {
        slotsRef.current = [
          ...slotsRef.current,
          { dayOfWeek, startTime: slot.start, endTime: slot.end },
        ];
      }
      setRenderVer((v) => v + 1);

      const handleUp = () => {
        setIsDragging(false);
        setDragMode(null);
        touchedRef.current = new Set();
        onChangeRef.current(slotsRef.current);
        document.removeEventListener('pointerup', handleUp);
        document.removeEventListener('pointermove', handleMove);
      };

      const handleMove = (e: PointerEvent) => {
        if (!gridRef.current) return;
        const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
        const cell = el?.closest('[data-cell]') as HTMLElement | null;
        if (!cell) return;
        const cd = cell.dataset.day;
        const cs = cell.dataset.start;
        const ce = cell.dataset.end;
        if (cd === undefined || !cs || !ce) return;
        const cellDay = parseInt(cd, 10);
        const cellStart = cs;
        const cellEnd = ce;
        const key = getCellKey(cellDay, cellStart, cellEnd);

        if (touchedRef.current.has(key)) return;
        touchedRef.current.add(key);

        const currentlyActive = isActive(cellDay, cellStart, cellEnd);

        if (mode === 'remove' && currentlyActive) {
          slotsRef.current = slotsRef.current.filter(
            (s) => !(s.dayOfWeek === cellDay && s.startTime === cellStart && s.endTime === cellEnd),
          );
        } else if (mode === 'add' && !currentlyActive) {
          slotsRef.current = [
            ...slotsRef.current,
            { dayOfWeek: cellDay, startTime: cellStart, endTime: cellEnd },
          ];
        } else {
          return;
        }
        setRenderVer((v) => v + 1);
      };

      document.addEventListener('pointerup', handleUp);
      document.addEventListener('pointermove', handleMove);
    },
    [disabled, isActive],
  );

  const toggleDay = useCallback(
    (dayOfWeek: number) => {
      if (disabled) return;
      const names = HALF_HOUR_SLOTS;
      const allActive = names.every((s) => isActive(dayOfWeek, s.start, s.end));

      const others = slotsRef.current.filter((s) => s.dayOfWeek !== dayOfWeek);

      if (allActive) {
        slotsRef.current = others;
      } else {
        const toAdd = names
          .filter((s) => !isActive(dayOfWeek, s.start, s.end))
          .map((s) => ({ dayOfWeek, startTime: s.start, endTime: s.end }));
        slotsRef.current = [...others, ...toAdd];
      }
      setRenderVer((v) => v + 1);
      onChangeRef.current(slotsRef.current);
    },
    [disabled, isActive],
  );

  const isDayFull = useCallback(
    (dayOfWeek: number) =>
      HALF_HOUR_SLOTS.every((s) => isActive(dayOfWeek, s.start, s.end)),
    [isActive],
  );

  const isDayPartial = useCallback(
    (dayOfWeek: number) =>
      HALF_HOUR_SLOTS.some((s) => isActive(dayOfWeek, s.start, s.end)) &&
      !isDayFull(dayOfWeek),
    [isActive, isDayFull],
  );

  const savingClass = disabled ? 'opacity-60 pointer-events-none' : '';

  return (
    <div className={`overflow-x-auto ${savingClass}`}>
      <div ref={gridRef} className="grid select-none" style={{ gridTemplateColumns: `70px repeat(7, 1fr)`, minWidth: 560 }}>
        <div className="p-1" />
        {DAY_NAMES.map((day, i) => (
          <button
            key={day}
            type="button"
            onClick={() => toggleDay(i)}
            className={`p-2 text-center text-xs font-bold rounded-t-lg transition-colors cursor-pointer border-b-2 ${
              isDayFull(i)
                ? 'bg-blue-50 text-blue-700 border-blue-500'
                : isDayPartial(i)
                  ? 'bg-blue-50/50 text-blue-600 border-blue-300'
                  : 'text-gray-400 border-transparent hover:bg-gray-50'
            }`}
          >
            {day}
          </button>
        ))}

        {HALF_HOUR_SLOTS.map((slot) => (
          <div key={slot.start} className="contents">
            <div className={`p-1.5 text-[10px] text-gray-400 flex items-center justify-end pr-2 ${
              slot.start.endsWith(':00') ? 'font-semibold text-gray-500' : ''
            }`}>
              {slot.label}
            </div>
            {Array.from({ length: 7 }).map((_, dayIdx) => {
              const active = isActive(dayIdx, slot.start, slot.end);
              const cellKey = getCellKey(dayIdx, slot.start, slot.end);
              const isDraggingThis = isDragging && touchedRef.current.has(cellKey);

              return (
                <div
                  key={cellKey}
                  data-cell
                  data-day={dayIdx}
                  data-start={slot.start}
                  data-end={slot.end}
                  onPointerDown={() => handlePointerDown(dayIdx, slot)}
                  className={`h-7 m-[1px] rounded transition-colors cursor-pointer touch-none ${
                    active
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : isDraggingThis
                        ? 'bg-blue-400'
                        : 'bg-gray-50 hover:bg-gray-100'
                  } ${slot.start.endsWith(':00') ? 'border-t border-gray-200' : ''}`}
                  role="checkbox"
                  aria-checked={active}
                  aria-label={`${DAY_NAMES[dayIdx]} ${slot.start}-${slot.end}`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
