// @vitest-environment node
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { GET } from "./route";

const fetchMock = vi.fn<typeof fetch>();
const errorLog = vi.fn();

const rainText = (values: number[]) =>
    values.map((value, i) => `${String(value).padStart(3, "0")}|13:${String(i * 5).padStart(2, "0")}`).join("\n") +
    "\n" +
    Array.from({ length: 12 }, (_, i) => `000|14:${String(i * 5).padStart(2, "0")}`).join("\n");

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

test("returns the forecast for the configured location", async () => {
    fetchMock.mockResolvedValue(new Response(rainText([0, 0, 0, 120, 120, 0, 0, 0, 0, 0, 0, 0])));

    const response = await GET();

    expect(response.status).toBe(200);
    expect(errorLog).not.toHaveBeenCalled();
    expect(await response.json()).toEqual({ kind: "starts", at: "13:15" });
    const url = new URL(String(fetchMock.mock.calls[0][0]));
    expect(url.origin + url.pathname).toBe("https://gps.buienradar.nl/getrr.php");
    expect(url.searchParams.get("lat")).toBe("51.62");
    expect(url.searchParams.get("lon")).toBe("5.55");
});

test("fails with 502 when Buienradar returns an error", async () => {
    fetchMock.mockResolvedValue(new Response("Service Unavailable", { status: 503 }));

    const response = await GET();

    expect(response.status).toBe(502);
    expect(errorLog).toHaveBeenCalledTimes(1);
    expect(await response.json()).toEqual({ error: "Buienradar returned 503" });
});

test("fails with 502 when Buienradar can't be reached", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));

    const response = await GET();

    expect(response.status).toBe(502);
    expect(errorLog).toHaveBeenCalledTimes(1);
    expect(await response.json()).toEqual({ error: "Buienradar could not be reached" });
});

test.each([
    ["an empty body", ""],
    ["an HTML page", "<html>Error</html>"],
])("fails with 502 on %s", async (_, body) => {
    fetchMock.mockResolvedValue(new Response(body));

    const response = await GET();

    expect(response.status).toBe(502);
    expect(errorLog).toHaveBeenCalledTimes(1);
    expect(await response.json()).toEqual({ error: "Unexpected response from Buienradar" });
});
