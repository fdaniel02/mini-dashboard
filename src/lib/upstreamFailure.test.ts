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

const unreachable = { upstream: "Buienradar", route: "/api/weather", error: "Buienradar could not be reached" };

test("answers 502 with the error", async () => {
    const response = upstreamFailure(unreachable);

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "Buienradar could not be reached" });
});

test("logs one JSON line with the route and the error", () => {
    upstreamFailure(unreachable);

    expect(logged).toHaveLength(1);
    expect(JSON.parse(logged[0])).toEqual({
        level: "error",
        msg: "Buienradar request failed",
        route: "/api/weather",
        error: "Buienradar could not be reached",
    });
});

test("names the upstream that failed", () => {
    upstreamFailure({
        upstream: "Home Assistant",
        route: "/api/home-sensors/indoor",
        error: "Home Assistant could not be reached",
    });

    expect(JSON.parse(logged[0])).toMatchObject({
        msg: "Home Assistant request failed",
        route: "/api/home-sensors/indoor",
    });
});

test("includes the upstream's status when there is one", () => {
    upstreamFailure({ upstream: "Buienradar", route: "/api/weather", error: "Buienradar returned 503", status: 503 });

    expect(JSON.parse(logged[0])).toMatchObject({ route: "/api/weather", status: 503 });
});

test("includes the trace id of the request being handled", () => {
    vi.spyOn(trace, "getActiveSpan").mockReturnValue(
        trace.wrapSpanContext({
            traceId: "5171ce7d634cde38917e2f463dc0459f",
            spanId: "6a0f3c1b2d4e5f60",
            traceFlags: TraceFlags.SAMPLED,
        }),
    );

    upstreamFailure({ upstream: "Buienradar", route: "/api/weather", error: "Buienradar returned 500", status: 500 });

    expect(JSON.parse(logged[0])).toMatchObject({ trace_id: "5171ce7d634cde38917e2f463dc0459f" });
});
