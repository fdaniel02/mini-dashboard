export interface Weather {
    temperatureC: number;
    windKph: number;
    condition: string;
    iconUrl: string;
    updatedAt: string;
}

interface WeatherApiCurrent {
    temp_c?: unknown;
    wind_kph?: unknown;
    last_updated_epoch?: unknown;
    condition?: { text?: unknown; icon?: unknown };
}

export function toWeather(body: unknown): Weather | null {
    const current = (body as { current?: WeatherApiCurrent } | null)?.current;
    const temperatureC = current?.temp_c;
    const windKph = current?.wind_kph;
    const updatedEpoch = current?.last_updated_epoch;
    const condition = current?.condition?.text;
    const icon = current?.condition?.icon;

    if (
        typeof temperatureC !== "number" ||
        typeof windKph !== "number" ||
        typeof updatedEpoch !== "number" ||
        typeof condition !== "string" ||
        typeof icon !== "string" ||
        !icon.startsWith("//cdn.weatherapi.com/")
    ) {
        return null;
    }

    return {
        temperatureC,
        windKph,
        condition,
        iconUrl: `https:${icon}`,
        updatedAt: new Date(updatedEpoch * 1000).toISOString(),
    };
}
