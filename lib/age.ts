export type AgeResult = {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  nextBirthday: Date;
  daysUntilBirthday: number;
  bornOn: string;
};

function parseIsoDate(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function clampDay(year: number, monthIndex: number, day: number): number {
  return Math.min(day, daysInMonth(year, monthIndex));
}

function dateOnly(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function calculateAge(dobIso: string, asOfIso: string): AgeResult | { error: string } {
  const dob = parseIsoDate(dobIso);
  const asOf = parseIsoDate(asOfIso);
  if (!dob || !asOf) return { error: "Enter a valid calendar date." };
  if (asOf < dob) return { error: "The as-of date is earlier than the date of birth." };

  let years = asOf.getFullYear() - dob.getFullYear();
  let months = asOf.getMonth() - dob.getMonth();
  let anchor = new Date(
    asOf.getFullYear(),
    asOf.getMonth(),
    clampDay(asOf.getFullYear(), asOf.getMonth(), dob.getDate()),
  );

  if (asOf < anchor) {
    months -= 1;
    const monthIndex = asOf.getMonth() - 1;
    const year = monthIndex < 0 ? asOf.getFullYear() - 1 : asOf.getFullYear();
    const resolvedMonth = (monthIndex + 12) % 12;
    anchor = new Date(year, resolvedMonth, clampDay(year, resolvedMonth, dob.getDate()));
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const days = Math.round((dateOnly(asOf).getTime() - dateOnly(anchor).getTime()) / 86_400_000);
  const totalDays = Math.round((dateOnly(asOf).getTime() - dateOnly(dob).getTime()) / 86_400_000);
  const nextBirthday = upcomingBirthday(dob, asOf);
  const daysUntilBirthday = Math.round(
    (dateOnly(nextBirthday).getTime() - dateOnly(asOf).getTime()) / 86_400_000,
  );

  return {
    years,
    months,
    days,
    totalDays,
    nextBirthday,
    daysUntilBirthday,
    bornOn: dob.toLocaleDateString("en-US", { weekday: "long" }),
  };
}

function upcomingBirthday(dob: Date, asOf: Date): Date {
  const year = asOf.getFullYear();
  const thisYear = new Date(year, dob.getMonth(), clampDay(year, dob.getMonth(), dob.getDate()));
  if (thisYear < asOf) {
    return new Date(year + 1, dob.getMonth(), clampDay(year + 1, dob.getMonth(), dob.getDate()));
  }
  return thisYear;
}

export function todayIso(): string {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export type PreciseAge = AgeResult & {
  hours: number;
  minutes: number;
  totalWeeks: number;
  totalHours: number;
  totalMinutes: number;
};

export type DateSpan = {
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  negative: boolean;
};

export function nowLocalInput(): string {
  return toLocalInput(new Date());
}

export function calculateAgePrecise(birthValue: string, asOfValue: string): PreciseAge | { error: string } {
  const birth = parseDateTime(birthValue);
  const asOf = parseDateTime(asOfValue);
  if (!birth || !asOf) return { error: "Enter a valid date and time." };
  if (asOf < birth) return { error: "The as-of moment is earlier than the birth moment." };

  let calendarAsOf = new Date(asOf.getFullYear(), asOf.getMonth(), asOf.getDate());
  let hours = asOf.getHours() - birth.getHours();
  let minutes = asOf.getMinutes() - birth.getMinutes();
  if (minutes < 0) {
    hours -= 1;
    minutes += 60;
  }
  if (hours < 0) {
    hours += 24;
    calendarAsOf = new Date(calendarAsOf.getFullYear(), calendarAsOf.getMonth(), calendarAsOf.getDate() - 1);
  }

  const calendar = calculateAge(toIsoDate(birth), toIsoDate(calendarAsOf));
  if ("error" in calendar) return calendar;

  const totalMinutes = Math.floor((asOf.getTime() - birth.getTime()) / 60_000);
  return {
    ...calendar,
    hours,
    minutes,
    totalWeeks: Math.floor(Math.floor(totalMinutes / 60) / 24 / 7),
    totalHours: Math.floor(totalMinutes / 60),
    totalMinutes,
  };
}

export function dateDifference(startValue: string, endValue: string): DateSpan | { error: string } {
  const start = parseDateTime(startValue);
  const end = parseDateTime(endValue);
  if (!start || !end) return { error: "Enter both dates." };
  const negative = end < start;
  const totalMinutes = Math.floor(Math.abs(end.getTime() - start.getTime()) / 60_000);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);
  return {
    weeks: Math.floor(totalDays / 7),
    days: totalDays % 7,
    hours: totalHours % 24,
    minutes: totalMinutes % 60,
    totalDays,
    totalHours,
    totalMinutes,
    negative,
  };
}

function parseDateTime(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = match[4] === undefined ? 0 : Number(match[4]);
  const minute = match[5] === undefined ? 0 : Number(match[5]);
  if (hour > 23 || minute > 59) return null;
  const date = new Date(year, month - 1, day, hour, minute, 0, 0);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

function toIsoDate(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function toLocalInput(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hour = `${date.getHours()}`.padStart(2, "0");
  const minute = `${date.getMinutes()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}T${hour}:${minute}`;
}
