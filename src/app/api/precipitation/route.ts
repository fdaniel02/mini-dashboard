import { PRECIPITATION_LOCATION } from "@/config";
import { parseRainText, summarize } from "@/lib/precipitation";

function upstreamError(error: string) {
    return Response.json({ error }, { status: 502 });
}

export async function GET() {
    const url = new URL("https://gps.buienradar.nl/getrr.php");
    url.search = new URLSearchParams({
        lat: String(PRECIPITATION_LOCATION.lat),
        lon: String(PRECIPITATION_LOCATION.lon),
    }).toString();

    let response: Response;
    try {
        response = await fetch(url, { cache: "no-store" });
    } catch {
        return upstreamError("Buienradar could not be reached");
    }
    if (!response.ok) {
        return upstreamError(`Buienradar returned ${response.status}`);
    }

    const rows = parseRainText(await response.text());
    return rows ? Response.json(summarize(rows)) : upstreamError("Unexpected response from Buienradar");
}
