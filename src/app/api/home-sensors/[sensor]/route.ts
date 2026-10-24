import { connection } from "next/server";
import { HOME_SENSORS } from "@/config";
import { parseSensorState } from "@/lib/homeAssistant";
import { upstreamFailure } from "@/lib/upstreamFailure";

const HOME_ASSISTANT = "Home Assistant";
const TIMEOUT_MS = 10_000;

export async function GET(_request: Request, { params }: RouteContext<"/api/home-sensors/[sensor]">) {
    // Request-time only, like the weather route.
    await connection();

    const { sensor } = await params;
    if (!Object.hasOwn(HOME_SENSORS, sensor)) {
        return Response.json({ error: `Unknown sensor "${sensor}"` }, { status: 404 });
    }
    const entities = HOME_SENSORS[sensor as keyof typeof HOME_SENSORS];

    const baseUrl = process.env.HOME_ASSISTANT_URL;
    const token = process.env.HOME_ASSISTANT_TOKEN;
    if (!baseUrl || !token) {
        return Response.json({ error: "Home Assistant is not configured" }, { status: 503 });
    }

    const route = `/api/home-sensors/${sensor}`;
    const fail = (error: string, status?: number) =>
        upstreamFailure({ upstream: HOME_ASSISTANT, route, error, status });
    const fetchState = (entityId: string) =>
        fetch(new URL(`/api/states/${entityId}`, baseUrl), {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
            signal: AbortSignal.timeout(TIMEOUT_MS),
        });

    let responses: Response[];
    try {
        responses = await Promise.all([fetchState(entities.temperature), fetchState(entities.humidity)]);
    } catch {
        return fail("Home Assistant could not be reached");
    }
    const failed = responses.find((response) => !response.ok);
    if (failed) {
        return fail(`Home Assistant returned ${failed.status}`, failed.status);
    }

    const [temperatureC, humidityPercent] = await Promise.all(
        responses.map((response) => response.json().then(parseSensorState, () => null)),
    );
    if (temperatureC === null || humidityPercent === null) {
        return fail("Unusable sensor state from Home Assistant");
    }
    return Response.json({ temperatureC, humidityPercent });
}
