import { trace } from "@opentelemetry/api";

export function upstreamFailure(route: string, error: string, upstreamStatus?: number): Response {
    const traceId = trace.getActiveSpan()?.spanContext().traceId;
    console.error(
        JSON.stringify({
            level: "error",
            msg: "Buienradar request failed",
            route,
            error,
            ...(upstreamStatus !== undefined && { status: upstreamStatus }),
            ...(traceId && { trace_id: traceId }),
        }),
    );
    return Response.json({ error }, { status: 502 });
}
