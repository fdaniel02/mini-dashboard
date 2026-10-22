export const HOME_TIME_ZONE = "Europe/Amsterdam";

export const WEATHER_STATIONS = [
    { id: 6375, name: "Volkel" },
    { id: 6370, name: "Eindhoven" },
];

export const PRECIPITATION_LOCATION = { name: "Veghel", lat: 51.62, lon: 5.55 };

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
