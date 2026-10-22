import { type Attributes, type Context, SpanKind } from "@opentelemetry/api";
import { ParentBasedSampler, SamplingDecision, type Sampler } from "@opentelemetry/sdk-trace-base";

const UNTRACED_PATHS = new Set(["/healthz/live"]);

// Next.js also starts parentless spans of its own (e.g. "load route module" at startup); only incoming requests start a
// trace, and the probes' health checks don't. Every other span follows its parent's decision.
const requestsExceptHealthChecks: Sampler = {
    shouldSample(_context: Context, _traceId: string, _spanName: string, spanKind: SpanKind, attributes: Attributes) {
        const path = String(attributes["http.target"] ?? "").split("?")[0];
        const traced = spanKind === SpanKind.SERVER && !UNTRACED_PATHS.has(path);
        return { decision: traced ? SamplingDecision.RECORD_AND_SAMPLED : SamplingDecision.NOT_RECORD };
    },
    toString: () => "RequestsExceptHealthChecks",
};

export const traceSampler = new ParentBasedSampler({ root: requestsExceptHealthChecks });
