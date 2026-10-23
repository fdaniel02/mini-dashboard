// @vitest-environment node
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { GET } from "./route";

vi.mock("next/server", () => ({ connection: () => Promise.resolve() }));

const TEMPERATURE = "http://homeassistant.lan:8123/api/states/sensor.sonoff_snzb_02d_temperature";
const HUMIDITY = "http://homeassistant.lan:8123/api/states/sensor.sonoff_snzb_02d_humidity";

const state = (value: string) => Response.json({ entity_id: "sensor.x", state: value, attributes: {} });

const fetchMock = vi.fn<typeof fetch>();
const errorLog = vi.fn();

function answer(byUrl: Record<string, () => Promise<Response>>) {
    fetchMock.mockImplementation((input) => byUrl[String(input)]());
}

const get = (sensor: string) => GET(new Request("http://localhost"), { params: Promise.resolve({ sensor }) });

beforeEach(() => {
    vi.stubEnv("HOME_ASSISTANT_URL", "http://homeassistant.lan:8123");
    vi.stubEnv("HOME_ASSISTANT_TOKEN", "test-token");
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(errorLog);
});

afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
    errorLog.mockReset();
    vi.restoreAllMocks();
});

test("returns the sensor's temperature and humidity", async () => {
    answer({ [TEMPERATURE]: async () => state("18.5"), [HUMIDITY]: async () => state("58.1") });

    const response = await get("indoor");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ temperatureC: 18.5, humidityPercent: 58.1 });
    expect(errorLog).not.toHaveBeenCalled();
    const headers = new Headers(fetchMock.mock.calls[0][1]?.headers);
    expect(headers.get("Authorization")).toBe("Bearer test-token");
});

test("answers 404 for a sensor that isn't configured", async () => {
    const response = await get("garage");

    expect(response.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
});

test.each(["toString", "__proto__"])("doesn't treat %s as a sensor", async (sensor) => {
    expect((await get(sensor)).status).toBe(404);
});

test.each([
    ["the URL", "HOME_ASSISTANT_URL"],
    ["the token", "HOME_ASSISTANT_TOKEN"],
])("answers 503 without logging when %s isn't set", async (_, variable) => {
    vi.stubEnv(variable, "");

    const response = await get("indoor");

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "Home Assistant is not configured" });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(errorLog).not.toHaveBeenCalled();
});

test("fails with 502 when Home Assistant can't be reached", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));

    const response = await get("indoor");

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "Home Assistant could not be reached" });
    expect(errorLog).toHaveBeenCalledTimes(1);
    expect(JSON.parse(errorLog.mock.calls[0][0])).toMatchObject({
        msg: "Home Assistant request failed",
        route: "/api/home-sensors/indoor",
    });
});

test("fails with 502 when Home Assistant returns an error", async () => {
    answer({
        [TEMPERATURE]: async () => state("18.5"),
        [HUMIDITY]: async () => Response.json({ message: "Entity not found." }, { status: 404 }),
    });

    const response = await get("indoor");

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "Home Assistant returned 404" });
    expect(errorLog).toHaveBeenCalledTimes(1);
});

test.each([
    ["the temperature is unavailable", state("unavailable"), state("58.1")],
    ["the humidity is unknown", state("18.5"), state("unknown")],
    ["a body isn't JSON", new Response("<html>"), state("58.1")],
])("fails with 502 when %s", async (_, temperature, humidity) => {
    answer({ [TEMPERATURE]: async () => temperature, [HUMIDITY]: async () => humidity });

    const response = await get("indoor");

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "Unusable sensor state from Home Assistant" });
    expect(errorLog).toHaveBeenCalledTimes(1);
});

test("never sends the token to the browser", async () => {
    fetchMock.mockResolvedValue(Response.json({ message: "Unauthorized" }, { status: 401 }));

    const response = await get("indoor");

    expect(await response.text()).not.toContain("test-token");
});
