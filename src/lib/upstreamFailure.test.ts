// @vitest-environment node
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { trace, TraceFlags } from "@opentelemetry/api";
import { upstreamFailure } from "./upstreamFailure";

let logged: string[];

beforeEach(() => {
    logged = [];
    vi.spyOn(console, "error").mockImplementation((line: string) => logged.push(line));
});

afterEach(() => {
    vi.restoreAllMocks();
});

test("answers 502 with the error", async () => {
    const response = upstreamFailure("/api/weather", "Buienradar could not be reached");

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "Buienradar could not be reached" });
});

test("logs one JSON line with the route and the error", () => {
    upstreamFailure("/api/weather", "Buienradar could not be reached");

    expect(logged).toHaveLength(1);
    expect(JSON.parse(logged[0])).toEqual({
        level: "error",
        msg: "Buienradar request failed",
        route: "/api/weather",
        error: "Buienradar could not be reached",
    });
});

test("includes Buienradar's status when there is one", () => {
    upstreamFailure("/api/precipitation", "Buienradar returned 503", 503);

    expect(JSON.parse(logged[0])).toMatchObject({ route: "/api/precipitation", status: 503 });
});

test("includes the trace id of the request being handled", () => {
    vi.spyOn(trace, "getActiveSpan").mockReturnValue(
        trace.wrapSpanContext({
            traceId: "5171ce7d634cde38917e2f463dc0459f",
            spanId: "6a0f3c1b2d4e5f60",
            traceFlags: TraceFlags.SAMPLED,
        }),
    );

    upstreamFailure("/api/weather", "Buienradar returned 500", 500);

    expect(JSON.parse(logged[0])).toMatchObject({ trace_id: "5171ce7d634cde38917e2f463dc0459f" });
});
