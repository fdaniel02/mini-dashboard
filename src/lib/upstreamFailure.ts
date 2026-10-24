import { trace } from "@opentelemetry/api";

export interface UpstreamFailure {
    upstream: string;
    route: string;
    error: string;
    status?: number;
}

export function upstreamFailure({ upstream, route, error, status }: UpstreamFailure): Response {
    const traceId = trace.getActiveSpan()?.spanContext().traceId;
    console.error(
        JSON.stringify({
            level: "error",
            msg: `${upstream} request failed`,
            route,
            error,
            ...(status !== undefined && { status }),
            ...(traceId && { trace_id: traceId }),
        }),
    );
    return Response.json({ error }, { status: 502 });
}
