import { WEATHER_STATIONS } from "@/config";
import { upstreamFailure } from "@/lib/upstreamFailure";
import { toWeather } from "@/lib/weather";

const ROUTE = "/api/weather";

export async function GET() {
    let response: Response;
    try {
        response = await fetch("https://data.buienradar.nl/2.0/feed/json", { cache: "no-store" });
    } catch {
        return upstreamFailure(ROUTE, "Buienradar could not be reached");
    }
    if (!response.ok) {
        return upstreamFailure(ROUTE, `Buienradar returned ${response.status}`, response.status);
    }

    const weather = toWeather(
        await response.json().catch(() => null),
        WEATHER_STATIONS.map((station) => station.id),
    );
    return weather ? Response.json(weather) : upstreamFailure(ROUTE, "No usable station measurement from Buienradar");
}
