import { describe, expect, test } from "vitest";
import { mmPerHour, parseRainText, precipitationText, type RainRow, summarize } from "./precipitation";

function rainText(values: number[], start = "13:00"): string {
    const [hours, minutes] = start.split(":").map(Number);
    return values
        .map((value, i) => {
            const total = (hours * 60 + minutes + i * 5) % (24 * 60);
            const time = `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
            return `${String(value).padStart(3, "0")}|${time}`;
        })
        .join("\r\n");
}

const DRY = 0;
const WET = 100;
const hours2 = (values: number[]) => [...values, ...Array(24 - values.length).fill(DRY)];
const rows = (values: number[]) => parseRainText(rainText(hours2(values))) as RainRow[];

describe("mmPerHour", () => {
    test("follows Buienradar's formula", () => {
        expect(mmPerHour(77)).toBeCloseTo(0.1);
        expect(mmPerHour(109)).toBe(1);
        expect(mmPerHour(0)).toBeLessThan(0.001);
    });
});

describe("parseRainText", () => {
    test("reads value and time from each line", () => {
        expect(parseRainText("000|12:55\n077|13:00\n" + rainText(Array(11).fill(DRY), "13:05"))?.slice(0, 2)).toEqual([
            { value: 0, time: "12:55" },
            { value: 77, time: "13:00" },
        ]);
    });

    test.each([
        ["an empty response", ""],
        ["an HTML page", "<html><body>Error</body></html>"],
        ["a value over 255", rainText([256, ...Array(23).fill(DRY)])],
        ["less than an hour of rows", rainText(Array(12).fill(DRY))],
    ])("rejects %s", (_, text) => {
        expect(parseRainText(text)).toBeNull();
    });
});

describe("summarize", () => {
    test("is dry when nothing falls in the next hour", () => {
        expect(summarize(rows([]))).toEqual({ kind: "dry" });
    });

    test("ignores precipitation after the next hour", () => {
        expect(summarize(rows([...Array(13).fill(DRY), WET]))).toEqual({ kind: "dry" });
    });

    test("reports when precipitation starts", () => {
        expect(summarize(rows([DRY, DRY, DRY, WET]))).toEqual({ kind: "starts", at: "13:15" });
    });

    test("reports a start at the end of the hour", () => {
        expect(summarize(rows([...Array(12).fill(DRY), WET]))).toEqual({ kind: "starts", at: "14:00" });
    });

    test("reports when ongoing precipitation stops", () => {
        expect(summarize(rows([WET, WET, WET, WET, DRY]))).toEqual({ kind: "stops", at: "13:20" });
    });

    test("reports that it continues when it rains the whole hour", () => {
        expect(summarize(rows(Array(13).fill(WET)))).toEqual({ kind: "continues" });
    });

    test("counts less than 0.1 mm/h as dry", () => {
        expect(summarize(rows([76, 76, 76]))).toEqual({ kind: "dry" });
        expect(summarize(rows([76, 77]))).toEqual({ kind: "starts", at: "13:05" });
    });

    test("works across midnight", () => {
        const text = rainText([DRY, DRY, WET, ...Array(21).fill(DRY)], "23:55");
        expect(summarize(parseRainText(text) as RainRow[])).toEqual({ kind: "starts", at: "00:05" });
    });
});

describe("precipitationText", () => {
    test.each([
        [{ kind: "starts", at: "13:15" } as const, "Precipitation expected at 13:15"],
        [{ kind: "stops", at: "13:20" } as const, "Precipitation expected to stop at 13:20"],
        [{ kind: "continues" } as const, "This rain never stops"],
        [{ kind: "dry" } as const, "No precipitation expected"],
    ])("%o", (forecast, text) => {
        expect(precipitationText(forecast)).toBe(text);
    });
});
