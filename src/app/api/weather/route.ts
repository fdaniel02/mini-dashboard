import { WEATHER_STATIONS } from "@/config";
import { toWeather } from "@/lib/weather";

function upstreamError(error: string) {
    return Response.json({ error }, { status: 502 });
}

export async function GET() {
    let response: Response;
    try {
        response = await fetch("https://data.buienradar.nl/2.0/feed/json", { cache: "no-store" });
    } catch {
        return upstreamError("Buienradar could not be reached");
    }
    if (!response.ok) {
        return upstreamError(`Buienradar returned ${response.status}`);
    }

    const weather = toWeather(
        await response.json().catch(() => null),
        WEATHER_STATIONS.map((station) => station.id),
    );
    return weather ? Response.json(weather) : upstreamError("No usable station measurement from Buienradar");
}
