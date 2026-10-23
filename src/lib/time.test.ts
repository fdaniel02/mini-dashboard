import { describe, expect, test } from "vitest";
import { formatDate, formatIsoWeek, formatTime, isoWeek, isoWeekDate, utcOffset, zoneAbbreviation } from "./time";

const AMSTERDAM = "Europe/Amsterdam";
const NEW_YORK = "America/New_York";
const KOLKATA = "Asia/Kolkata";
const UTC = "Etc/UTC";

const at = (iso: string) => new Date(iso);

describe("formatDate", () => {
    test("formats the date with the weekday", () => {
        expect(formatDate(at("2026-10-22T10:00:00Z"), AMSTERDAM)).toBe("2026-10-22, Thursday");
    });

    test("uses the date in the given time zone, not UTC", () => {
        const lateEvening = at("2026-10-22T22:30:00Z");
        expect(formatDate(lateEvening, AMSTERDAM)).toBe("2026-10-23, Friday");
        expect(formatDate(lateEvening, UTC)).toBe("2026-10-22, Thursday");
    });
});

describe("isoWeekDate", () => {
    test.each([
        ["2026-10-22T10:00:00Z", 2026, 43],
        ["2027-01-01T12:00:00Z", 2026, 53],
        ["2024-12-30T12:00:00Z", 2025, 1],
    ])("%s is week %i of %i", (iso, year, week) => {
        expect(isoWeekDate(new Date(iso), "Europe/Amsterdam")).toEqual({ year, week });
    });
});

describe("isoWeek", () => {
    test.each([
        ["2026-10-22T10:00:00Z", 43],
        ["2026-01-01T12:00:00Z", 1],
        ["2027-01-01T12:00:00Z", 53],
        ["2024-12-30T12:00:00Z", 1],
        ["2026-12-28T12:00:00Z", 53],
    ])("%s is week %i", (iso, week) => {
        expect(isoWeek(at(iso), AMSTERDAM)).toBe(week);
    });

    test("uses the date in the given time zone", () => {
        const sundayNightUtc = at("2026-10-25T23:30:00Z");
        expect(isoWeek(sundayNightUtc, UTC)).toBe(43);
        expect(isoWeek(sundayNightUtc, AMSTERDAM)).toBe(44);
    });

    test("pads to two digits", () => {
        expect(formatIsoWeek(at("2026-01-05T12:00:00Z"), AMSTERDAM)).toBe("W02");
        expect(formatIsoWeek(at("2026-10-22T10:00:00Z"), AMSTERDAM)).toBe("W43");
    });
});

describe("formatTime", () => {
    test("formats hours and minutes, with seconds on request", () => {
        const date = at("2026-10-22T10:04:05Z");
        expect(formatTime(date, AMSTERDAM)).toBe("12:04");
        expect(formatTime(date, AMSTERDAM, { seconds: true })).toBe("12:04:05");
        expect(formatTime(date, KOLKATA)).toBe("15:34");
    });

    test("shows midnight as 00, not 24", () => {
        expect(formatTime(at("2026-01-01T23:00:00Z"), AMSTERDAM, { seconds: true })).toBe("00:00:00");
    });
});

describe("zone abbreviation and offset", () => {
    test("for the secondary clocks", () => {
        const date = at("2026-10-22T10:00:00Z");
        expect(zoneAbbreviation(date, KOLKATA, "en-IN")).toBe("IST");
        expect(utcOffset(date, KOLKATA)).toBe("+05:30");
        expect(zoneAbbreviation(date, NEW_YORK, "en-US")).toBe("EDT");
        expect(utcOffset(date, NEW_YORK)).toBe("-04:00");
        expect(zoneAbbreviation(date, UTC, "en-GB")).toBe("UTC");
        expect(utcOffset(date, UTC)).toBe("+00:00");
    });

    test("Amsterdam DST ends on 2026-10-25 at 01:00 UTC", () => {
        const before = at("2026-10-25T00:59:59Z");
        const after = at("2026-10-25T01:00:00Z");
        expect(formatTime(before, AMSTERDAM, { seconds: true })).toBe("02:59:59");
        expect(formatTime(after, AMSTERDAM, { seconds: true })).toBe("02:00:00");
        expect(zoneAbbreviation(before, AMSTERDAM, "en-GB")).toBe("CEST");
        expect(zoneAbbreviation(after, AMSTERDAM, "en-GB")).toBe("CET");
        expect(utcOffset(before, AMSTERDAM)).toBe("+02:00");
        expect(utcOffset(after, AMSTERDAM)).toBe("+01:00");
    });

    test("New York DST ends on 2026-11-01 at 06:00 UTC", () => {
        const before = at("2026-11-01T05:59:00Z");
        const after = at("2026-11-01T06:00:00Z");
        expect(formatTime(before, NEW_YORK)).toBe("01:59");
        expect(formatTime(after, NEW_YORK)).toBe("01:00");
        expect(zoneAbbreviation(before, NEW_YORK, "en-US")).toBe("EDT");
        expect(zoneAbbreviation(after, NEW_YORK, "en-US")).toBe("EST");
        expect(utcOffset(before, NEW_YORK)).toBe("-04:00");
        expect(utcOffset(after, NEW_YORK)).toBe("-05:00");
    });
});
