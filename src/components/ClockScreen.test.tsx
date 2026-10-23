import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import ClockScreen from "./ClockScreen";

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-22T10:00:00Z"));
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue(Response.json({ temperatureC: 17.8, humidityPercent: 55.5 }));
});

afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
});

async function advance(ms: number) {
    await act(async () => {
        await vi.advanceTimersByTimeAsync(ms);
    });
}

test("shows the date bar and the Amsterdam clock", async () => {
    render(<ClockScreen />);

    expect(screen.getByText("2026-10-22, Thursday")).toBeDefined();
    expect(screen.getByText("W43")).toBeDefined();
    expect(screen.getByText("12:00:00")).toBeDefined();

    await advance(1000);
    expect(screen.getByText("12:00:01")).toBeDefined();
});

test("shows the attic's temperature and humidity, large and in the clock's font", async () => {
    render(<ClockScreen />);
    await advance(0);

    expect(fetchMock).toHaveBeenCalledWith("/api/home-sensors/attic");
    const reading = screen.getByText("17.8 °C").parentElement!;
    expect(screen.getByText("55.5 %").parentElement).toBe(reading);
    expect(reading.className).toContain("text-[6vw]");
    expect(reading.className).toContain("font-mono");
});

test("keeps the clock when Home Assistant has no reading", async () => {
    fetchMock.mockResolvedValue(Response.json({ error: "Home Assistant could not be reached" }, { status: 502 }));
    render(<ClockScreen />);
    await advance(0);

    expect(screen.getByText("12:00:00")).toBeDefined();
    expect(screen.queryByText(/°C/)).toBeNull();
});
