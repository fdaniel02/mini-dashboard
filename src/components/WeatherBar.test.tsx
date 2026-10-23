import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { POLL_INTERVAL_MS, STALE_AFTER_MS } from "@/lib/usePolled";
import type { Weather } from "@/lib/weather";
import { WEATHER_ICON_PATHS } from "@/lib/weatherIconPaths";
import WeatherBar from "./WeatherBar";

const weather: Weather = {
    temperatureC: 8.1,
    windKph: 24.1,
    condition: "Lichte regen",
    iconCode: "f",
};
const indoor = { temperatureC: 18.5, humidityPercent: 58.1 };

type Reply = () => Promise<Response>;
const ok =
    (body: unknown): Reply =>
    () =>
        Promise.resolve(Response.json(body));
const failing: Reply = () => Promise.reject(new TypeError("fetch failed"));
const error: Reply = () => Promise.resolve(Response.json({ error: "Upstream returned 503" }, { status: 503 }));

const replies: Record<string, Reply[]> = {};
const fetchMock = vi.fn<typeof fetch>((input) => {
    const queue = replies[String(input)];
    const reply = queue.length > 1 ? queue.shift()! : queue[0];
    return reply();
});

function respond(url: "/api/weather" | "/api/home-sensors/indoor", ...queue: Reply[]) {
    replies[url] = queue;
}

const callsTo = (url: string) => fetchMock.mock.calls.filter(([input]) => String(input) === url).length;

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-22T10:00:00Z"));
    vi.stubGlobal("fetch", fetchMock);
    respond("/api/weather", ok(weather));
    respond("/api/home-sensors/indoor", ok(indoor));
});

afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    fetchMock.mockClear();
});

async function advance(ms: number) {
    await act(async () => {
        await vi.advanceTimersByTimeAsync(ms);
    });
}

test("shows the weather, the indoor reading and the source", async () => {
    render(<WeatherBar />);
    expect(screen.queryByText(/°C/)).toBeNull();

    await advance(0);

    const icon = screen.getByRole("img", { name: "Lichte regen" });
    expect(icon.querySelector("path")?.getAttribute("d")).toBe(WEATHER_ICON_PATHS.rainy_light);
    expect(screen.getByText("8.1 °C")).toBeDefined();
    expect(screen.getByText("24.1 km/h")).toBeDefined();
    expect(screen.getByText("18.5 °C")).toBeDefined();
    expect(screen.getByText("58.1 %")).toBeDefined();
    expect(screen.getByRole("link", { name: "Buienradar.nl" }).getAttribute("href")).toBe("https://www.buienradar.nl");
});

test("always shows Buienradar's values with one decimal", async () => {
    respond("/api/weather", ok({ ...weather, temperatureC: 11, windKph: 24 }));
    render(<WeatherBar />);
    await advance(0);

    expect(screen.getByText("11.0 °C")).toBeDefined();
    expect(screen.getByText("24.0 km/h")).toBeDefined();
});

test("keeps the bar to the readings and the mute button, with the credit floating above its right end", async () => {
    render(<WeatherBar />);
    await advance(0);
    const indoorGroup = screen.getByText("18.5 °C").parentElement!;
    const muteButton = screen.getByRole("button", { name: "Mute the gong" });

    expect(screen.getByText("24.1 km/h").parentElement!.nextElementSibling).toBe(indoorGroup);
    expect(indoorGroup.className).toContain("text-2xl");
    expect(indoorGroup.nextElementSibling).toBe(muteButton);
    expect(muteButton.className).toContain("ml-auto");
    const credit = screen.getByRole("link", { name: "Buienradar.nl" });
    expect(credit.className).toContain("absolute");
    expect(credit.className).toContain("bottom-full");
    expect(credit.className).toContain("right-4");
    expect(credit.className).toContain("w-[165px]");
    expect(credit.className).toContain("z-10");
});

test("credits the source even before any data has loaded", () => {
    respond("/api/weather", failing);
    respond("/api/home-sensors/indoor", failing);
    render(<WeatherBar />);

    expect(screen.getByRole("link", { name: "Buienradar.nl" })).toBeDefined();
});

test("shows the indoor reading when the weather request fails", async () => {
    respond("/api/weather", error);
    render(<WeatherBar />);
    await advance(0);

    expect(screen.queryByText("8.1 °C")).toBeNull();
    expect(screen.getByText("18.5 °C")).toBeDefined();
});

test("keeps Buienradar's readings when Home Assistant fails", async () => {
    respond("/api/home-sensors/indoor", error);
    render(<WeatherBar />);
    await advance(0);

    expect(screen.getByText("8.1 °C")).toBeDefined();
    expect(screen.queryByText("18.5 °C")).toBeNull();
});

test("refreshes both every 5 minutes", async () => {
    respond("/api/weather", ok(weather), ok({ ...weather, temperatureC: 9.4 }));
    respond("/api/home-sensors/indoor", ok(indoor), ok({ ...indoor, temperatureC: 19.1 }));
    render(<WeatherBar />);
    await advance(0);

    await advance(POLL_INTERVAL_MS);

    expect(callsTo("/api/weather")).toBe(2);
    expect(callsTo("/api/home-sensors/indoor")).toBe(2);
    expect(screen.getByText("9.4 °C")).toBeDefined();
    expect(screen.getByText("19.1 °C")).toBeDefined();
});

test("keeps the last readings when refreshes fail, and dims each once it is stale", async () => {
    respond("/api/weather", ok(weather), failing);
    respond("/api/home-sensors/indoor", ok(indoor), failing);
    render(<WeatherBar />);
    await advance(0);
    const weatherGroup = () => screen.getByText("8.1 °C").parentElement!;
    const indoorGroup = () => screen.getByText("18.5 °C").parentElement!;

    await advance(POLL_INTERVAL_MS);
    expect(weatherGroup().className).not.toContain("opacity-40");
    expect(indoorGroup().className).not.toContain("opacity-40");

    await advance(STALE_AFTER_MS);
    expect(weatherGroup().className).toContain("opacity-40");
    expect(indoorGroup().className).toContain("opacity-40");
});

test("stops refreshing when unmounted", async () => {
    const { unmount } = render(<WeatherBar />);
    await advance(0);

    unmount();
    await advance(POLL_INTERVAL_MS * 3);

    expect(callsTo("/api/weather")).toBe(1);
    expect(callsTo("/api/home-sensors/indoor")).toBe(1);
    expect(vi.getTimerCount()).toBe(0);
});
