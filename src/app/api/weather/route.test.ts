// @vitest-environment node
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { GET } from "./route";

vi.mock("next/server", () => ({ connection: () => Promise.resolve() }));

const volkel = {
    stationid: 6375,
    stationname: "Meetstation Volkel",
    temperature: 11,
    windspeed: 9.6,
    weatherdescription: "Zwaar bewolkt",
    iconurl: "https://cdn.buienradar.nl/resources/images/icons/weather/30x30/c.png",
};
const eindhoven = {
    ...volkel,
    stationid: 6370,
    stationname: "Meetstation Eindhoven",
    temperature: 11.4,
    windspeed: 7.3,
};
const elsewhere = { ...volkel, stationid: 6260, stationname: "Meetstation De Bilt", temperature: 9 };

const feed = (...stations: object[]) => Response.json({ actual: { stationmeasurements: stations } });

const fetchMock = vi.fn<typeof fetch>();
const errorLog = vi.fn();

beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(errorLog);
});

afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
    errorLog.mockReset();
    vi.restoreAllMocks();
});

test("returns the current weather at Volkel", async () => {
    fetchMock.mockResolvedValue(feed(elsewhere, eindhoven, volkel));

    const response = await GET();

    expect(response.status).toBe(200);
    expect(errorLog).not.toHaveBeenCalled();
    expect(await response.json()).toEqual({
        temperatureC: 11,
        windKph: 34.6,
        condition: "Zwaar bewolkt",
        iconCode: "c",
    });
    expect(String(fetchMock.mock.calls[0][0])).toBe("https://data.buienradar.nl/2.0/feed/json");
});

test("falls back to Eindhoven when Volkel's reading is incomplete", async () => {
    fetchMock.mockResolvedValue(feed({ ...volkel, temperature: undefined }, eindhoven));

    const response = await GET();

    expect(await response.json()).toMatchObject({ temperatureC: 11.4, windKph: 26.3 });
});

test.each([
    ["the night variant", "https://cdn.buienradar.nl/resources/images/icons/weather/30x30/cc.png", "cc"],
    ["an upper-case file name", "https://cdn.buienradar.nl/resources/images/icons/weather/96x96/Q.png", "q"],
    ["an unexpected file name", "https://cdn.buienradar.nl/resources/images/icons/weather/30x30/new-icon.png", ""],
    ["no icon", undefined, ""],
])("takes the icon code from the icon's file name: %s", async (_, iconurl, iconCode) => {
    fetchMock.mockResolvedValue(feed({ ...volkel, iconurl }));

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ iconCode });
});

test.each([
    ["no configured station", feed(elsewhere)],
    ["no stations at all", Response.json({ actual: {} })],
    ["a body that isn't JSON", new Response("<html>")],
])("fails with 502 on %s", async (_, upstreamResponse) => {
    fetchMock.mockResolvedValue(upstreamResponse);

    const response = await GET();

    expect(response.status).toBe(502);
    expect(errorLog).toHaveBeenCalledTimes(1);
    expect(await response.json()).toEqual({ error: "No usable station measurement from Buienradar" });
});

test("fails with 502 when Buienradar returns an error", async () => {
    fetchMock.mockResolvedValue(new Response("", { status: 500 }));

    const response = await GET();

    expect(response.status).toBe(502);
    expect(errorLog).toHaveBeenCalledTimes(1);
    expect(await response.json()).toEqual({ error: "Buienradar returned 500" });
});

test("fails with 502 when Buienradar can't be reached", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));

    const response = await GET();

    expect(response.status).toBe(502);
    expect(errorLog).toHaveBeenCalledTimes(1);
    expect(await response.json()).toEqual({ error: "Buienradar could not be reached" });
});

test("gives up on Buienradar after 10 seconds", async () => {
    const timeout = vi.spyOn(AbortSignal, "timeout");
    fetchMock.mockResolvedValue(feed(volkel));

    await GET();

    expect(timeout).toHaveBeenCalledWith(10_000);
    expect(fetchMock.mock.calls[0][1]?.signal).toBe(timeout.mock.results[0].value);
});

test("fails with 502 when Buienradar times out", async () => {
    fetchMock.mockRejectedValue(new DOMException("The operation was aborted due to timeout", "TimeoutError"));

    const response = await GET();

    expect(response.status).toBe(502);
    expect(errorLog).toHaveBeenCalledTimes(1);
    expect(await response.json()).toEqual({ error: "Buienradar could not be reached" });
});
