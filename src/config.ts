export const HOME_TIME_ZONE = "Europe/Amsterdam";

export const WEATHER_STATIONS = [
    { id: 6375, name: "Volkel" },
    { id: 6370, name: "Eindhoven" },
];

// Home Assistant entity ids per sensor; each is served at /api/home-sensors/<name>.
export const HOME_SENSORS = {
    indoor: {
        temperature: "sensor.sonoff_snzb_02d_temperature",
        humidity: "sensor.sonoff_snzb_02d_humidity",
    },
    attic: {
        temperature: "sensor.sonoff_snzb_02d_temperature_2",
        humidity: "sensor.sonoff_snzb_02d_humidity_2",
    },
} satisfies Record<string, { temperature: string; humidity: string }>;

export type HomeSensorName = keyof typeof HOME_SENSORS;

export const GONG = { minute: 55, firstHour: 9, lastHour: 21 };

export interface ZoneClockConfig {
    timeZone: string;
    // Intl only gives a zone's abbreviation (IST, EDT) in a locale where it's used; elsewhere it falls back to GMT+5:30.
    abbreviationLocale: string;
}

export const SECONDARY_CLOCK_ROWS: ZoneClockConfig[][] = [
    [
        { timeZone: "Asia/Kolkata", abbreviationLocale: "en-IN" },
        { timeZone: "America/New_York", abbreviationLocale: "en-US" },
    ],
    [{ timeZone: "Etc/UTC", abbreviationLocale: "en-GB" }],
];
