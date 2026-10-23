export interface HomeReading {
    temperatureC: number;
    humidityPercent: number;
}

// Home Assistant reports sensor values as strings, and "unavailable" or "unknown" when it has none.
export function parseSensorState(body: unknown): number | null {
    const state = (body as { state?: unknown } | null)?.state;
    if (typeof state !== "string" || state.trim() === "") {
        return null;
    }
    const value = Number(state);
    return Number.isFinite(value) ? value : null;
}
