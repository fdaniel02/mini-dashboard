// @vitest-environment node
import { describe, expect, test } from "vitest";
import { type Attributes, context, ROOT_CONTEXT, SpanKind, trace, TraceFlags } from "@opentelemetry/api";
import { SamplingDecision } from "@opentelemetry/sdk-trace-base";
import { traceSampler } from "./telemetry";

const TRACE_ID = "5171ce7d634cde38917e2f463dc0459f";

function decide(spanKind: SpanKind, attributes: Attributes, parentContext = ROOT_CONTEXT) {
    return traceSampler.shouldSample(parentContext, TRACE_ID, "GET", spanKind, attributes, []).decision;
}

const withParent = (sampled: boolean) =>
    trace.setSpanContext(context.active(), {
        traceId: TRACE_ID,
        spanId: "6a0f3c1b2d4e5f60",
        traceFlags: sampled ? TraceFlags.SAMPLED : TraceFlags.NONE,
    });

describe("traceSampler", () => {
    test.each(["/api/weather", "/api/precipitation", "/", "/clock", "/api/weather?x=1"])(
        "traces a request to %s",
        (path) => {
            expect(decide(SpanKind.SERVER, { "http.target": path })).toBe(SamplingDecision.RECORD_AND_SAMPLED);
        },
    );

    test.each(["/healthz/live", "/healthz/live?probe=1"])("doesn't trace the health check %s", (path) => {
        expect(decide(SpanKind.SERVER, { "http.target": path })).toBe(SamplingDecision.NOT_RECORD);
    });

    test("doesn't start a trace for Next.js' own spans without a request", () => {
        expect(decide(SpanKind.INTERNAL, { "next.span_type": "LoadComponents.loadRouteModule" })).toBe(
            SamplingDecision.NOT_RECORD,
        );
    });

    test("keeps the spans inside a traced request", () => {
        expect(
            decide(SpanKind.CLIENT, { "http.url": "https://data.buienradar.nl/2.0/feed/json" }, withParent(true)),
        ).toBe(SamplingDecision.RECORD_AND_SAMPLED);
    });

    test("drops the spans inside an untraced request", () => {
        expect(decide(SpanKind.INTERNAL, {}, withParent(false))).toBe(SamplingDecision.NOT_RECORD);
    });
});
