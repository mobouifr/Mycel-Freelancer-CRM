import { useState, useCallback, useMemo } from 'react';

export type CalendarViewMode = 'month' | 'week' | 'day';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
] as const;

export { DAYS, MONTHS };

export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

export function getMonthGrid(year: number, month: number): (number | null)[] {
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function getWeekDates(date: Date): Date[] {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  const week: Date[] = [];
  for (let i = 0; i < 7; i++) {
    week.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return week;
}

export function getHoursOfDay(): number[] {
  return Array.from({ length: 24 }, (_, i) => i);
}

export function formatHour(h: number): string {
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
}

export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export default function useCalendar() {
  const today = useMemo(() => new Date(), []);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');

  const goToday = useCallback(() => setCurrentDate(new Date()), []);

  const goPrev = useCallback(() => {
    setCurrentDate((d) => {
      const n = new Date(d);
      if (viewMode === 'month') n.setMonth(n.getMonth() - 1);
      else if (viewMode === 'week') n.setDate(n.getDate() - 7);
      else n.setDate(n.getDate() - 1);
      return n;
    });
  }, [viewMode]);

  const goNext = useCallback(() => {
    setCurrentDate((d) => {
      const n = new Date(d);
      if (viewMode === 'month') n.setMonth(n.getMonth() + 1);
      else if (viewMode === 'week') n.setDate(n.getDate() + 7);
      else n.setDate(n.getDate() + 1);
      return n;
    });
  }, [viewMode]);

  const goToDate = useCallback((d: Date) => setCurrentDate(new Date(d)), []);

  const monthGrid = useMemo(
    () => getMonthGrid(currentDate.getFullYear(), currentDate.getMonth()),
    [currentDate],
  );

  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);

  const headerLabel = useMemo(() => {
    if (viewMode === 'month')
      return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    if (viewMode === 'week') {
      const start = weekDates[0];
      const end = weekDates[6];
      const fmt = (d: Date) => `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
      return `${fmt(start)} – ${fmt(end)}, ${end.getFullYear()}`;
    }
    return currentDate.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
  }, [viewMode, currentDate, weekDates]);

  return {
    today,
    currentDate,
    viewMode,
    setViewMode,
    goToday,
    goPrev,
    goNext,
    goToDate,
    monthGrid,
    weekDates,
    headerLabel,
  };
}
