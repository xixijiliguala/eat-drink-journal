export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function isToday(date: Date): boolean {
  const t = new Date();
  return date.getFullYear() === t.getFullYear()
    && date.getMonth() === t.getMonth()
    && date.getDate() === t.getDate();
}

export function getMonthGrid(year: number, month: number): Date[][] {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const days: Date[] = [];

  const prevMonthDays = getDaysInMonth(year, month - 1 < 0 ? 11 : month - 1);
  const prevYear = month === 0 ? year - 1 : year;
  const prevMonth = month === 0 ? 11 : month - 1;
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push(new Date(prevYear, prevMonth, prevMonthDays - i));
  }

  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(year, month, d));
  }

  const remaining = 7 - (days.length % 7);
  if (remaining < 7) {
    const nextYear = month === 11 ? year + 1 : year;
    const nextMonth = month === 11 ? 0 : month + 1;
    for (let d = 1; d <= remaining; d++) {
      days.push(new Date(nextYear, nextMonth, d));
    }
  }

  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

export function getWeekDays(anchorDate: Date): Date[] {
  const day = anchorDate.getDay();
  const monday = new Date(anchorDate);
  monday.setDate(anchorDate.getDate() - day);

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

export function getMonthName(year: number, month: number): string {
  const names = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${names[month]} ${year}`;
}

export function getWeekRangeName(days: Date[]): string {
  const first = days[0];
  const last = days[6];

  const fMonth = first.toLocaleString('en-US', { month: 'short' });
  const lMonth = last.toLocaleString('en-US', { month: 'short' });

  if (fMonth === lMonth) {
    return `${fMonth} ${first.getDate()}-${last.getDate()}`;
  }
  return `${fMonth} ${first.getDate()} - ${lMonth} ${last.getDate()}`;
}

export function addMonths(date: Date, delta: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + delta);
  return d;
}

export function addWeeks(date: Date, delta: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + delta * 7);
  return d;
}
