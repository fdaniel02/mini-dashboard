import { describe, expect, test } from "vitest";
import { gongSlot } from "./gong";

const AMSTERDAM = "Europe/Amsterdam";
const at = (iso: string) => new Date(iso);

describe("gongSlot", () => {
    test.each([
        ["09:55, the first gong of the day", "2026-10-22T07:55:00Z"],
        ["21:55, the last gong of the day", "2026-10-22T19:55:59Z"],
        ["09:55 in winter time", "2026-12-01T08:55:00Z"],
    ])("is due at %s", (_, iso) => {
        expect(gongSlot(at(iso), AMSTERDAM)).not.toBeNull();
    });

    test.each([
        ["08:55, before the first hour", "2026-10-22T06:55:00Z"],
        ["22:55, after the last hour", "2026-10-22T20:55:00Z"],
        ["09:54", "2026-10-22T07:54:59Z"],
        ["09:56", "2026-10-22T07:56:00Z"],
        ["08:55 in winter time", "2026-12-01T07:55:00Z"],
    ])("is not due at %s", (_, iso) => {
        expect(gongSlot(at(iso), AMSTERDAM)).toBeNull();
    });

    test("uses the given time zone, not UTC", () => {
        const date = at("2026-10-22T07:55:00Z");
        expect(gongSlot(date, AMSTERDAM)).not.toBeNull();
        expect(gongSlot(date, "Etc/UTC")).toBeNull();
    });

    test("is the same slot for the whole minute and different for each hour", () => {
        const start = gongSlot(at("2026-10-22T07:55:00Z"), AMSTERDAM);
        expect(gongSlot(at("2026-10-22T07:55:59Z"), AMSTERDAM)).toBe(start);
        expect(gongSlot(at("2026-10-22T08:55:00Z"), AMSTERDAM)).not.toBe(start);
        expect(gongSlot(at("2026-10-23T07:55:00Z"), AMSTERDAM)).not.toBe(start);
    });
});
