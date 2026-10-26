import { describe, expect, test } from "vitest";
import { PI_CALENDAR } from "@/config";
import { piSprint } from "./pi";

const AMSTERDAM = "Europe/Amsterdam";

const at = (date: string) => new Date(`${date}T10:00:00Z`);

describe("PI calendar", () => {
    test.each([
        [14, 5, "2026-08-26", "2026-11-03"],
        [15, 6, "2026-11-04", "2027-01-26"],
        [16, 5, "2027-01-27", "2027-04-06"],
        [17, 5, "2027-04-07", "2027-06-15"],
        [18, 5, "2027-06-16", "2027-08-24"],
        [19, 5, "2027-08-25", "2027-11-02"],
        [20, 6, "2027-11-03", "2028-01-25"],
        [21, 5, "2028-01-26", "2028-04-04"],
    ])("PI%i has %i sprints, from %s to %s", (pi, sprints, start, end) => {
        expect(piSprint(at(start), AMSTERDAM)).toEqual({ pi, sprint: 1, workingDaysLeft: 10 });
        expect(piSprint(at(end), AMSTERDAM)).toEqual({ pi, sprint: sprints, workingDaysLeft: 1 });
    });

    test("starts on a Wednesday", () => {
        expect(new Date(PI_CALENDAR.firstStart).getUTCDay()).toBe(3);
    });

    test("has consecutive PI numbers with a whole number of sprints each", () => {
        const entries = Object.entries(PI_CALENDAR.sprints).map(([pi, sprints]) => [Number(pi), sprints]);
        entries.forEach(([pi, sprints], index) => {
            expect(pi).toBe(entries[0][0] + index);
            expect(Number.isInteger(sprints) && sprints >= 1).toBe(true);
        });
    });
});

describe("piSprint", () => {
    test.each([
        ["2026-10-21", "Wednesday, first day", 10],
        ["2026-10-23", "Friday", 8],
        ["2026-10-24", "Saturday", 7],
        ["2026-10-25", "Sunday", 7],
        ["2026-10-26", "Monday", 7],
        ["2026-10-27", "Tuesday", 6],
        ["2026-11-02", "Monday of the last week", 2],
        ["2026-11-03", "Tuesday, last day", 1],
    ])("%s (%s) has %i working days left in PI14.5", (date, _, workingDaysLeft) => {
        expect(piSprint(at(date), AMSTERDAM)).toEqual({ pi: 14, sprint: 5, workingDaysLeft });
    });

    test("switches to the next sprint at midnight on Wednesday in Amsterdam, not in UTC", () => {
        const tuesdayNight = new Date("2026-11-03T22:59:59Z");
        const wednesdayMidnight = new Date("2026-11-03T23:00:00Z");

        expect(piSprint(tuesdayNight, AMSTERDAM)).toMatchObject({ pi: 14, sprint: 5 });
        expect(piSprint(wednesdayMidnight, AMSTERDAM)).toMatchObject({ pi: 15, sprint: 1 });
        expect(piSprint(wednesdayMidnight, "Etc/UTC")).toMatchObject({ pi: 14, sprint: 5 });
    });

    test("returns null outside the calendar", () => {
        expect(piSprint(at("2026-08-25"), AMSTERDAM)).toBeNull();
        expect(piSprint(at("2028-04-05"), AMSTERDAM)).toBeNull();
    });

    test("an extra sprint moves every later PI by two weeks", () => {
        const calendar = { ...PI_CALENDAR, sprints: { ...PI_CALENDAR.sprints, 17: 6 } };

        expect(piSprint(at("2027-06-16"), AMSTERDAM, calendar)).toMatchObject({ pi: 17, sprint: 6 });
        expect(piSprint(at("2027-06-30"), AMSTERDAM, calendar)).toMatchObject({ pi: 18, sprint: 1 });
        expect(piSprint(at("2028-04-18"), AMSTERDAM, calendar)).toMatchObject({ pi: 21, sprint: 5 });
        expect(piSprint(at("2028-04-19"), AMSTERDAM, calendar)).toBeNull();
    });
});
