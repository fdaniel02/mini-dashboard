import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import type { PrecipitationForecast } from "@/lib/precipitation";
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
const startsAt1315: PrecipitationForecast = { kind: "starts", at: "13:15" };

type Reply = () => Promise<Response>;
const ok =
    (body: unknown): Reply =>
    () =>
        Promise.resolve(Response.json(body));
const failing: Reply = () => Promise.reject(new TypeError("fetch failed"));
const error: Reply = () => Promise.resolve(Response.json({ error: "Buienradar returned 503" }, { status: 503 }));

const replies: Record<string, Reply[]> = {};
const fetchMock = vi.fn<typeof fetch>((input) => {
    const queue = replies[String(input)];
    const reply = queue.length > 1 ? queue.shift()! : queue[0];
    return reply();
});

function respond(url: "/api/weather" | "/api/precipitation" | "/api/home-sensors/indoor", ...queue: Reply[]) {
    replies[url] = queue;
}

const callsTo = (url: string) => fetchMock.mock.calls.filter(([input]) => String(input) === url).length;

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-22T10:00:00Z"));
    vi.stubGlobal("fetch", fetchMock);
    respond("/api/weather", ok(weather));
    respond("/api/precipitation", ok(startsAt1315));
    respond("/api/home-sensors/indoor", ok({ temperatureC: 18.5, humidityPercent: 58.1 }));
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

test("shows the weather, the precipitation forecast and the source", async () => {
    render(<WeatherBar />);
    expect(screen.queryByText(/°C/)).toBeNull();
    expect(screen.queryByText("13:15")).toBeNull();

    await advance(0);

    expect(screen.getByText("8.1 °C")).toBeDefined();
    expect(screen.getByText("24.1 km/h")).toBeDefined();
    const icon = screen.getByRole("img", { name: "Lichte regen" });
    expect(icon.querySelector("path")?.getAttribute("d")).toBe(WEATHER_ICON_PATHS.rainy_light);
    expect(screen.getByText("13:15")).toBeDefined();
    expect(screen.getByRole("link", { name: "Buienradar.nl" }).getAttribute("href")).toBe("https://www.buienradar.nl");
});

test("keeps the bar to the readings and the mute button, with the credit floating above its right end", async () => {
    respond("/api/precipitation", ok(startsAt1315), ok({ kind: "dry" }));
    render(<WeatherBar />);
    await advance(0);
    const indoor = screen.getByText("18.5 °C").parentElement!;
    const muteButton = screen.getByRole("button", { name: "Mute the gong" });

    expect(screen.getByText("13:15").parentElement!.nextElementSibling).toBe(indoor);
    expect(indoor.nextElementSibling).toBe(muteButton);
    expect(muteButton.className).toContain("ml-auto");
    const credit = screen.getByRole("link", { name: "Buienradar.nl" });
    expect(credit.className).toContain("absolute");
    expect(credit.className).toContain("bottom-full");
    expect(credit.className).toContain("right-4");
    expect(credit.className).toContain("w-[165px]");
    expect(credit.className).toContain("z-10");

    await advance(POLL_INTERVAL_MS);
    expect(screen.getByText("24.1 km/h").parentElement!.nextElementSibling).toBe(indoor);
});

test("credits the source even before any data has loaded", () => {
    respond("/api/weather", failing);
    respond("/api/precipitation", failing);
    render(<WeatherBar />);

    expect(screen.getByRole("link", { name: "Buienradar.nl" })).toBeDefined();
});

test("shows the forecast when the weather request fails", async () => {
    respond("/api/weather", error);
    render(<WeatherBar />);
    await advance(0);

    expect(screen.queryByText("8.1 °C")).toBeNull();
    expect(screen.getByText("13:15")).toBeDefined();
});

test("keeps Buienradar's readings when Home Assistant fails", async () => {
    respond("/api/home-sensors/indoor", error);
    render(<WeatherBar />);
    await advance(0);

    expect(screen.getByText("8.1 °C")).toBeDefined();
    expect(screen.getByText("13:15")).toBeDefined();
    expect(screen.queryByText("18.5 °C")).toBeNull();
});

test("shows the weather when the forecast request fails", async () => {
    respond("/api/precipitation", failing);
    render(<WeatherBar />);
    await advance(0);

    expect(screen.getByText("8.1 °C")).toBeDefined();
    expect(screen.queryByText("13:15")).toBeNull();
});

test("shows when ongoing precipitation stops", async () => {
    respond("/api/precipitation", ok({ kind: "stops", at: "13:20" }));
    render(<WeatherBar />);
    await advance(0);

    expect(screen.getByText("until 13:20")).toBeDefined();
});

test.each([
    ["dry", { kind: "dry" }],
    ["raining the whole hour", { kind: "continues" }],
])("shows no forecast when it's %s", async (_, forecast) => {
    respond("/api/precipitation", ok(forecast));
    render(<WeatherBar />);
    await advance(0);

    expect(screen.getByText("24.1 km/h").parentElement!.nextElementSibling).toBe(
        screen.getByText("18.5 °C").parentElement,
    );
});

test("refreshes both every 5 minutes", async () => {
    respond("/api/weather", ok(weather), ok({ ...weather, temperatureC: 9.4 }));
    respond("/api/precipitation", ok(startsAt1315), ok({ kind: "stops", at: "13:40" }));
    render(<WeatherBar />);
    await advance(0);

    await advance(POLL_INTERVAL_MS);

    expect(callsTo("/api/weather")).toBe(2);
    expect(callsTo("/api/precipitation")).toBe(2);
    expect(screen.getByText("9.4 °C")).toBeDefined();
    expect(screen.getByText("until 13:40")).toBeDefined();
});

test("keeps the last readings when refreshes fail, and dims each once it is stale", async () => {
    respond("/api/weather", ok(weather), failing);
    respond("/api/precipitation", ok(startsAt1315), failing);
    render(<WeatherBar />);
    await advance(0);
    const weatherGroup = () => screen.getByText("8.1 °C").parentElement!;
    const forecast = () => screen.getByText("13:15").parentElement!;

    await advance(POLL_INTERVAL_MS);
    expect(weatherGroup().className).not.toContain("opacity-40");
    expect(forecast().className).not.toContain("opacity-40");

    await advance(STALE_AFTER_MS);
    expect(weatherGroup().className).toContain("opacity-40");
    expect(forecast().className).toContain("opacity-40");
});

test("stops refreshing when unmounted", async () => {
    const { unmount } = render(<WeatherBar />);
    await advance(0);

    unmount();
    await advance(POLL_INTERVAL_MS * 3);

    expect(callsTo("/api/weather")).toBe(1);
    expect(callsTo("/api/precipitation")).toBe(1);
    expect(vi.getTimerCount()).toBe(0);
});
