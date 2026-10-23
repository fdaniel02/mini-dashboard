import { expect, test } from "vitest";
import { sprintId, sprintWeek } from "./sprint";

const AMSTERDAM = "Europe/Amsterdam";

test.each([
    ["2026-10-22T10:00:00Z", "week 43", "S-2621", "First week"],
    ["2026-10-26T10:00:00Z", "week 44", "S-2621", "Last week"],
    ["2026-01-01T10:00:00Z", "week 1", "S-2600", "First week"],
    ["2026-01-05T10:00:00Z", "week 2", "S-2600", "Last week"],
    ["2026-01-12T10:00:00Z", "week 3", "S-2601", "First week"],
    ["2026-12-28T10:00:00Z", "week 53, the extra week", "S-2626", "First week"],
    ["2027-01-01T10:00:00Z", "week 53 of 2026, in calendar year 2027", "S-2626", "First week"],
    ["2027-01-04T10:00:00Z", "week 1 of 2027", "S-2700", "First week"],
    ["2024-12-30T10:00:00Z", "week 1 of 2025, in calendar year 2024", "S-2500", "First week"],
])("%s (%s) is %s, %s", (iso, _, id, week) => {
    expect(sprintId(new Date(iso), AMSTERDAM)).toBe(id);
    expect(sprintWeek(new Date(iso), AMSTERDAM)).toBe(week);
});

test("switches at midnight on Monday in Amsterdam, not in UTC", () => {
    const sundayNight = new Date("2026-10-25T22:59:59Z");
    const mondayMidnight = new Date("2026-10-25T23:00:00Z");

    expect(sprintWeek(sundayNight, AMSTERDAM)).toBe("First week");
    expect(sprintWeek(mondayMidnight, AMSTERDAM)).toBe("Last week");
    expect(sprintWeek(mondayMidnight, "Etc/UTC")).toBe("First week");
});

test("switches to the next sprint at midnight on a sprint's first Monday", () => {
    expect(sprintId(new Date("2026-11-01T22:59:59Z"), AMSTERDAM)).toBe("S-2621");
    expect(sprintId(new Date("2026-11-01T23:00:00Z"), AMSTERDAM)).toBe("S-2622");
});
