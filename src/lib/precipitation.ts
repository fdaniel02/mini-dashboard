export interface RainRow {
    value: number;
    time: string;
}

export type PrecipitationForecast =
    { kind: "dry" } | { kind: "continues" } | { kind: "starts"; at: string } | { kind: "stops"; at: string };

const MIN_MM_PER_HOUR = 0.1;
const NEXT_HOUR_ROWS = 13;

export function mmPerHour(value: number): number {
    return 10 ** ((value - 109) / 32);
}

const isWet = (row: RainRow) => mmPerHour(row.value) >= MIN_MM_PER_HOUR;

export function parseRainText(text: string): RainRow[] | null {
    const lines = text.trim().split(/\r?\n/);
    const rows: RainRow[] = [];
    for (const line of lines) {
        const match = /^(\d{1,3})\|(\d{2}:\d{2})$/.exec(line.trim());
        const value = Number(match?.[1]);
        if (!match || value > 255) {
            return null;
        }
        rows.push({ value, time: match[2] });
    }
    return rows.length >= NEXT_HOUR_ROWS ? rows : null;
}

export function summarize(rows: RainRow[]): PrecipitationForecast {
    const nextHour = rows.slice(0, NEXT_HOUR_ROWS);

    if (isWet(nextHour[0])) {
        const dry = nextHour.find((row) => !isWet(row));
        return dry ? { kind: "stops", at: dry.time } : { kind: "continues" };
    }

    const wet = nextHour.find(isWet);
    return wet ? { kind: "starts", at: wet.time } : { kind: "dry" };
}

export function precipitationText(forecast: PrecipitationForecast): string {
    switch (forecast.kind) {
        case "starts":
            return `Precipitation expected at ${forecast.at}`;
        case "stops":
            return `Precipitation expected to stop at ${forecast.at}`;
        case "continues":
            return "This rain never stops";
        case "dry":
            return "No precipitation expected";
    }
}
