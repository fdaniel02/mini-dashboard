export interface Weather {
    temperatureC: number;
    windKph: number;
    condition: string;
    iconUrl: string;
}

interface StationMeasurement {
    stationid?: unknown;
    temperature?: unknown;
    windspeed?: unknown;
    weatherdescription?: unknown;
    fullIconUrl?: unknown;
}

function fromStation(station: StationMeasurement | undefined): Weather | null {
    const temperatureC = station?.temperature;
    const windMetresPerSecond = station?.windspeed;
    const condition = station?.weatherdescription;
    const iconUrl = station?.fullIconUrl;

    if (
        typeof temperatureC !== "number" ||
        typeof windMetresPerSecond !== "number" ||
        typeof condition !== "string" ||
        typeof iconUrl !== "string" ||
        !iconUrl.startsWith("https://cdn.buienradar.nl/")
    ) {
        return null;
    }

    return {
        temperatureC,
        windKph: Math.round(windMetresPerSecond * 3.6 * 10) / 10,
        condition,
        iconUrl,
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
