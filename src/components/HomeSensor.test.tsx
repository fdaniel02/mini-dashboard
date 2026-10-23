import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { POLL_INTERVAL_MS, STALE_AFTER_MS } from "@/lib/usePolled";
import HomeSensor from "./HomeSensor";

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-23T10:00:00Z"));
    vi.stubGlobal("fetch", fetchMock);
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

test("shows the sensor's temperature and humidity", async () => {
    fetchMock.mockResolvedValue(Response.json({ temperatureC: 18.5, humidityPercent: 58.1 }));
    render(<HomeSensor sensor="indoor" />);
    expect(screen.queryByText(/°C/)).toBeNull();

    await advance(0);

    expect(fetchMock).toHaveBeenCalledWith("/api/home-sensors/indoor");
    expect(screen.getByText("18.5 °C")).toBeDefined();
    expect(screen.getByText("58.1 %")).toBeDefined();
});

test("shows nothing when there is no reading", async () => {
    fetchMock.mockResolvedValue(Response.json({ error: "Home Assistant is not configured" }, { status: 503 }));
    const { container } = render(<HomeSensor sensor="indoor" />);

    await advance(0);

    expect(container.innerHTML).toBe("");
});

test("keeps the last reading when a refresh fails, and dims it once it is stale", async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ temperatureC: 18.5, humidityPercent: 58.1 }));
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    render(<HomeSensor sensor="indoor" className="ml-8" />);
    await advance(0);
    const group = () => screen.getByText("18.5 °C").parentElement!;

    await advance(POLL_INTERVAL_MS);
    expect(group().className).toContain("ml-8");
    expect(group().className).not.toContain("opacity-40");

    await advance(STALE_AFTER_MS);
    expect(group().className).toContain("opacity-40");
});
