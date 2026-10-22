export interface Weather {
    temperatureC: number;
    windKph: number;
    condition: string;
    iconCode: string;
}

interface StationMeasurement {
    stationid?: unknown;
    temperature?: unknown;
    windspeed?: unknown;
    weatherdescription?: unknown;
    iconurl?: unknown;
}

// The code is the icon's file name: ".../weather/30x30/cc.png" -> "cc".
function iconCodeOf(iconUrl: unknown): string {
    return typeof iconUrl === "string" ? (/\/([a-z]{1,2})\.png$/i.exec(iconUrl)?.[1]?.toLowerCase() ?? "") : "";
}

function fromStation(station: StationMeasurement | undefined): Weather | null {
    const temperatureC = station?.temperature;
    const windMetresPerSecond = station?.windspeed;
    const condition = station?.weatherdescription;

    if (typeof temperatureC !== "number" || typeof windMetresPerSecond !== "number" || typeof condition !== "string") {
        return null;
    }

    return {
        temperatureC,
        windKph: Math.round(windMetresPerSecond * 3.6 * 10) / 10,
        condition,
        iconCode: iconCodeOf(station?.iconurl),
    };
}

export function toWeather(feed: unknown, stationIds: number[]): Weather | null {
    const stations = (feed as { actual?: { stationmeasurements?: unknown } } | null)?.actual?.stationmeasurements;
    if (!Array.isArray(stations)) {
        return null;
    }

    for (const id of stationIds) {
        const weather = fromStation(stations.find((station: StationMeasurement) => station?.stationid === id));
        if (weather) {
            return weather;
        }
    }
    return null;
}
