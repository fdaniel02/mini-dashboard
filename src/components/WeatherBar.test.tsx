import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import type { Weather } from "@/lib/weather";
import { WEATHER_REFRESH_MS } from "@/lib/useWeather";
import WeatherBar, { WEATHER_STALE_AFTER_MS } from "./WeatherBar";

const weather: Weather = {
    temperatureC: 8.1,
    windKph: 24.1,
    condition: "Light rain",
    iconUrl: "https://cdn.weatherapi.com/weather/64x64/day/296.png",
    updatedAt: "2026-10-22T07:25:00.000Z",
};

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-22T10:00:00Z"));
    vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
});

async function flushFetch() {
    await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
    });
}

async function advance(ms: number) {
    await act(async () => {
        await vi.advanceTimersByTimeAsync(ms);
    });
}

test("shows the weather once it has loaded", async () => {
    fetchMock.mockResolvedValue(Response.json(weather));
    render(<WeatherBar />);
    expect(screen.queryByText(/°C/)).toBeNull();

    await flushFetch();

    expect(fetchMock).toHaveBeenCalledWith("/api/weather");
    expect(screen.getByText("8.1 °C")).toBeDefined();
    expect(screen.getByText("24.1 km/h")).toBeDefined();
    expect(screen.getByAltText("Light rain")).toBeDefined();
});

test("shows nothing while the first request fails", async () => {
    fetchMock.mockResolvedValue(Response.json({ error: "WEATHER_API_KEY is not set" }, { status: 500 }));
    render(<WeatherBar />);

    await flushFetch();

    expect(screen.queryByText(/°C/)).toBeNull();
});

test("refreshes every 5 minutes", async () => {
    fetchMock.mockResolvedValueOnce(Response.json(weather));
    fetchMock.mockResolvedValueOnce(Response.json({ ...weather, temperatureC: 9.4 }));
    render(<WeatherBar />);
    await flushFetch();

    await advance(WEATHER_REFRESH_MS);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(screen.getByText("9.4 °C")).toBeDefined();
});

test("keeps the last reading when a refresh fails, and dims it once it is stale", async () => {
    fetchMock.mockResolvedValueOnce(Response.json(weather));
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    const { container } = render(<WeatherBar />);
    await flushFetch();

    await advance(WEATHER_REFRESH_MS);
    expect(screen.getByText("8.1 °C")).toBeDefined();
    expect(container.firstElementChild?.className).not.toContain("opacity-40");

    await advance(WEATHER_STALE_AFTER_MS);
    expect(screen.getByText("8.1 °C")).toBeDefined();
    expect(container.firstElementChild?.className).toContain("opacity-40");
});

test("stops refreshing when unmounted", async () => {
    fetchMock.mockResolvedValue(Response.json(weather));
    const { unmount } = render(<WeatherBar />);
    await flushFetch();

    unmount();
    await advance(WEATHER_REFRESH_MS * 3);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
});
