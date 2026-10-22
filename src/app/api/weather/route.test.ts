// @vitest-environment node
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { GET } from "./route";

const upstreamBody = {
    current: {
        temp_c: 8.1,
        wind_kph: 24.1,
        last_updated_epoch: 1792653900,
        condition: { text: "Light rain", icon: "//cdn.weatherapi.com/weather/64x64/day/296.png" },
    },
};

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
    vi.stubEnv("WEATHER_API_KEY", "test-key");
    vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
});

test("returns the current weather for the configured location", async () => {
    fetchMock.mockResolvedValue(Response.json(upstreamBody));

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
        temperatureC: 8.1,
        windKph: 24.1,
        condition: "Light rain",
        iconUrl: "https://cdn.weatherapi.com/weather/64x64/day/296.png",
        updatedAt: "2026-10-22T07:25:00.000Z",
    });
    const url = new URL(String(fetchMock.mock.calls[0][0]));
    expect(url.origin + url.pathname).toBe("https://api.weatherapi.com/v1/current.json");
    expect(url.searchParams.get("key")).toBe("test-key");
    expect(url.searchParams.get("q")).toBe("Veghel");
});

test("fails with 500 when the API key is missing", async () => {
    vi.stubEnv("WEATHER_API_KEY", "");

    const response = await GET();

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "WEATHER_API_KEY is not set" });
    expect(fetchMock).not.toHaveBeenCalled();
});

test("fails with 502 when weatherapi.com returns an error", async () => {
    fetchMock.mockResolvedValue(Response.json({ error: { message: "API key is invalid." } }, { status: 403 }));

    const response = await GET();

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "weatherapi.com returned 403" });
});

test("fails with 502 when weatherapi.com can't be reached", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));

    const response = await GET();

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "weatherapi.com could not be reached" });
});

test.each([
    ["a body that isn't JSON", new Response("<html>")],
    ["missing fields", Response.json({ current: { temp_c: 8.1 } })],
    [
        "an icon from another host",
        Response.json({
            current: { ...upstreamBody.current, condition: { text: "Sunny", icon: "//evil.example/x.png" } },
        }),
    ],
])("fails with 502 on %s", async (_, upstreamResponse) => {
    fetchMock.mockResolvedValue(upstreamResponse);

    const response = await GET();

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "Unexpected response from weatherapi.com" });
});

test("never sends the API key to the browser", async () => {
    fetchMock.mockResolvedValue(Response.json({}, { status: 401 }));

    const response = await GET();

    expect(await response.text()).not.toContain("test-key");
});
