import { connection } from "next/server";
import { PRECIPITATION_LOCATION } from "@/config";
import { parseRainText, summarize } from "@/lib/precipitation";
import { upstreamFailure } from "@/lib/upstreamFailure";

const ROUTE = "/api/precipitation";

export async function GET() {
    // Without this, the build starts the handler to try prerendering it and aborts its fetch, which would log a false
    // Buienradar failure.
    await connection();

    const url = new URL("https://gps.buienradar.nl/getrr.php");
    url.search = new URLSearchParams({
        lat: String(PRECIPITATION_LOCATION.lat),
        lon: String(PRECIPITATION_LOCATION.lon),
    }).toString();

    let response: Response;
    try {
        response = await fetch(url, { cache: "no-store" });
    } catch {
        return upstreamFailure(ROUTE, "Buienradar could not be reached");
    }
    if (!response.ok) {
        return upstreamFailure(ROUTE, `Buienradar returned ${response.status}`, response.status);
    }

    const rows = parseRainText(await response.text());
    return rows ? Response.json(summarize(rows)) : upstreamFailure(ROUTE, "Unexpected response from Buienradar");
}
