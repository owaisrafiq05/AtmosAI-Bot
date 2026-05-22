const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function toDateKey(date: Date): string {
  return startOfDay(date).toISOString().slice(0, 10);
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function parseDialogflowDate(
  value: unknown,
  sessionDate: Date
): Date | null {
  if (value == null || value === "") {
    return null;
  }

  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return startOfDay(parsed);
    }
  }

  if (typeof value === "object" && value !== null) {
    const record = value as Record<string, string>;
    if (record.startDate) {
      const parsed = new Date(record.startDate);
      if (!Number.isNaN(parsed.getTime())) {
        return startOfDay(parsed);
      }
    }
    if (record.date) {
      const parsed = new Date(record.date);
      if (!Number.isNaN(parsed.getTime())) {
        return startOfDay(parsed);
      }
    }
  }

  return startOfDay(sessionDate);
}

export function isSameDay(a: Date, b: Date): boolean {
  return toDateKey(a) === toDateKey(b);
}

export function daysBetweenInclusive(start: Date, end: Date): number {
  const diff = startOfDay(end).getTime() - startOfDay(start).getTime();
  return Math.floor(diff / MS_PER_DAY) + 1;
}

export function formatDisplayDate(dateKey: string): string {
  const d = new Date(`${dateKey}T12:00:00`);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
