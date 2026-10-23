import { isoWeekDate } from "./time";

// Sprints are two ISO weeks: weeks 1–2 are sprint 00, 3–4 sprint 01, and so on. In years with 53 weeks, week 53 is a
// sprint of its own (out of office anyway).
export function sprintId(date: Date, timeZone: string): string {
    const { year, week } = isoWeekDate(date, timeZone);
    const sprint = Math.ceil(week / 2) - 1;
    return `S-${String(year % 100).padStart(2, "0")}${String(sprint).padStart(2, "0")}`;
}

export function sprintWeek(date: Date, timeZone: string): "First week" | "Last week" {
    return isoWeekDate(date, timeZone).week % 2 === 0 ? "Last week" : "First week";
}
