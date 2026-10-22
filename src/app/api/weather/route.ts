import { WEATHER_LOCATION } from "@/config";
import { toWeather } from "@/lib/weather";

function upstreamError(error: string) {
    return Response.json({ error }, { status: 502 });
}

export async function GET() {
    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) {
        return Response.json({ error: "WEATHER_API_KEY is not set" }, { status: 500 });
    }

    const url = new URL("https://api.weatherapi.com/v1/current.json");
    url.search = new URLSearchParams({ key: apiKey, q: WEATHER_LOCATION, aqi: "no" }).toString();

    let response: Response;
    try {
        response = await fetch(url, { cache: "no-store" });
    } catch {
        return upstreamError("weatherapi.com could not be reached");
    }
    if (!response.ok) {
        return upstreamError(`weatherapi.com returned ${response.status}`);
    }

    const weather = toWeather(await response.json().catch(() => null));
    return weather ? Response.json(weather) : upstreamError("Unexpected response from weatherapi.com");
}
