import { PI_CALENDAR, type PiCalendar } from "@/config";
import { zonedDateTime } from "./time";

const SPRINT_DAYS = 14;
const DAY_MS = 86_400_000;

export interface PiSprint {
    pi: number;
    sprint: number;
    workingDaysLeft: number;
}

function workingDaysBetween(firstDay: number, lastDay: number): number {
    let count = 0;
    for (let day = firstDay; day <= lastDay; day++) {
        const weekday = new Date(day * DAY_MS).getUTCDay();
        if (weekday !== 0 && weekday !== 6) {
            count++;
        }
    }
    return count;
}

// Days are counted as calendar dates in the given time zone, so a sprint starts at local midnight whatever the UTC offset.
export function piSprint(date: Date, timeZone: string, calendar: PiCalendar = PI_CALENDAR): PiSprint | null {
    const { year, month, day } = zonedDateTime(date, timeZone);
    const today = Date.UTC(year, month - 1, day) / DAY_MS;
    let piStart = Date.parse(calendar.firstStart) / DAY_MS;

    for (const [pi, sprints] of Object.entries(calendar.sprints)) {
        const daysIntoPi = today - piStart;
        if (daysIntoPi < 0) {
            return null;
        }
        if (daysIntoPi < sprints * SPRINT_DAYS) {
            const sprintIndex = Math.floor(daysIntoPi / SPRINT_DAYS);
            const sprintEnd = piStart + (sprintIndex + 1) * SPRINT_DAYS - 1;
            return {
                pi: Number(pi),
                sprint: sprintIndex + 1,
                workingDaysLeft: workingDaysBetween(today, sprintEnd),
            };
        }
        piStart += sprints * SPRINT_DAYS;
    }
    return null;
}
