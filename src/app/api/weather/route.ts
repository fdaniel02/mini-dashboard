import { connection } from "next/server";
import { WEATHER_STATIONS } from "@/config";
import { upstreamFailure } from "@/lib/upstreamFailure";
import { toWeather } from "@/lib/weather";

const BUIENRADAR = "Buienradar";
const ROUTE = "/api/weather";
const TIMEOUT_MS = 10_000;

export async function GET() {
    // Without this, the build starts the handler to try prerendering it and aborts its fetch, which would log a false
    // Buienradar failure.
    await connection();

    const fail = (error: string, status?: number) =>
        upstreamFailure({ upstream: BUIENRADAR, route: ROUTE, error, status });

    let response: Response;
    try {
        response = await fetch("https://data.buienradar.nl/2.0/feed/json", {
            cache: "no-store",
            signal: AbortSignal.timeout(TIMEOUT_MS),
        });
    } catch {
        return fail("Buienradar could not be reached");
    }
    if (!response.ok) {
        return fail(`Buienradar returned ${response.status}`, response.status);
    }

    const weather = toWeather(
        await response.json().catch(() => null),
        WEATHER_STATIONS.map((station) => station.id),
    );
    return weather ? Response.json(weather) : fail("No usable station measurement from Buienradar");
}
