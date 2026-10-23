type PartType = Intl.DateTimeFormatPartTypes;

function formatParts(
    date: Date,
    timeZone: string,
    options: Intl.DateTimeFormatOptions,
    locale = "en-GB",
): Partial<Record<PartType, string>> {
    const parts = new Intl.DateTimeFormat(locale, { timeZone, ...options }).formatToParts(date);
    return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

export function zonedDateTime(date: Date, timeZone: string) {
    const { year, month, day, hour, minute } = formatParts(date, timeZone, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    });
    return { year: Number(year), month: Number(month), day: Number(day), hour: Number(hour), minute: Number(minute) };
}

export function formatDate(date: Date, timeZone: string): string {
    const { year, month, day, weekday } = formatParts(date, timeZone, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        weekday: "long",
    });
    return `${year}-${month}-${day}, ${weekday}`;
}

export function formatTime(date: Date, timeZone: string, { seconds = false } = {}): string {
    const { hour, minute, second } = formatParts(date, timeZone, {
        hour: "2-digit",
        minute: "2-digit",
        second: seconds ? "2-digit" : undefined,
        hourCycle: "h23",
    });
    return seconds ? `${hour}:${minute}:${second}` : `${hour}:${minute}`;
}

// The ISO week-year differs from the calendar year around New Year: 2027-01-01 is in week 53 of 2026.
export function isoWeekDate(date: Date, timeZone: string): { year: number; week: number } {
    const { year, month, day } = zonedDateTime(date, timeZone);
    const thursday = new Date(Date.UTC(year, month - 1, day));
    const isoWeekday = thursday.getUTCDay() || 7;
    thursday.setUTCDate(thursday.getUTCDate() + 4 - isoWeekday);
    const yearStart = Date.UTC(thursday.getUTCFullYear(), 0, 1);
    return {
        year: thursday.getUTCFullYear(),
        week: Math.ceil(((thursday.getTime() - yearStart) / 86_400_000 + 1) / 7),
    };
}

export function isoWeek(date: Date, timeZone: string): number {
    return isoWeekDate(date, timeZone).week;
}

export function formatIsoWeek(date: Date, timeZone: string): string {
    return `W${String(isoWeek(date, timeZone)).padStart(2, "0")}`;
}

export function zoneAbbreviation(date: Date, timeZone: string, locale: string): string {
    return formatParts(date, timeZone, { timeZoneName: "short" }, locale).timeZoneName ?? "";
}

export function utcOffset(date: Date, timeZone: string): string {
    const offset = formatParts(date, timeZone, { timeZoneName: "longOffset" }).timeZoneName ?? "";
    return offset.replace("GMT", "") || "+00:00";
}
