/** Locale-aware date bits for charts/calendars (uses active i18n language). */
export function monthShortLabels(language: string): string[] {
  const loc = language.split('-')[0] || 'en';
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(2024, i, 1);
    return new Intl.DateTimeFormat(loc, { month: 'short' }).format(d);
  });
}

export function formatMonthShort(isoDateYmd: string, language: string): string {
  const loc = language.split('-')[0] || 'en';
  return new Intl.DateTimeFormat(loc, { month: 'short' }).format(new Date(`${isoDateYmd}T12:00`));
}

export function weekdayShortLabels(language: string): string[] {
  const loc = language.split('-')[0] || 'en';
  const base = new Date(2024, 6, 7); // Sunday
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return new Intl.DateTimeFormat(loc, { weekday: 'narrow' }).format(d);
  });
}

/** Two-letter weekday labels (Su, Mo, …) for compact calendar headers */
export function weekdayTwoLetterLabels(language: string): string[] {
  const loc = language.split('-')[0] || 'en';
  const base = new Date(2024, 6, 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const s = new Intl.DateTimeFormat(loc, { weekday: 'short' }).format(d);
    return s.slice(0, 2).toUpperCase();
  });
}

export function formatMonthYearLabel(monthIndex: number, year: number, language: string): string {
  const loc = language.split('-')[0] || 'en';
  return new Intl.DateTimeFormat(loc, { month: 'short', year: 'numeric' }).format(new Date(year, monthIndex, 1));
}

export function formatDateLong(isoDateYmd: string, language: string): string {
  const loc = language.split('-')[0] || 'en';
  return new Intl.DateTimeFormat(loc, { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(`${isoDateYmd}T12:00`),
  );
}
