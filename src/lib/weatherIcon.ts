import type { WeatherIconName } from "./weatherIconPaths";

type DayAndNight = [day: WeatherIconName, night: WeatherIconName];

const BY_BUIENRADAR_CODE: Record<string, DayAndNight> = {
    a: ["sunny", "clear_night"],
    b: ["partly_cloudy_day", "partly_cloudy_night"],
    j: ["partly_cloudy_day", "partly_cloudy_night"],
    r: ["partly_cloudy_day", "partly_cloudy_night"],
    c: ["cloud", "cloud"],
    d: ["foggy", "foggy"],
    o: ["foggy", "foggy"],
    n: ["mist", "mist"],
    e: ["rainy_light", "rainy_light"],
    f: ["rainy_light", "rainy_light"],
    k: ["rainy_light", "rainy_light"],
    m: ["rainy_light", "rainy_light"],
    h: ["rainy", "rainy"],
    q: ["rainy_heavy", "rainy_heavy"],
    g: ["thunderstorm", "thunderstorm"],
    s: ["thunderstorm", "thunderstorm"],
    x: ["thunderstorm", "thunderstorm"],
    i: ["sunny_snowing", "cloudy_snowing"],
    u: ["sunny_snowing", "cloudy_snowing"],
    v: ["cloudy_snowing", "cloudy_snowing"],
    t: ["weather_snowy", "weather_snowy"],
    w: ["rainy_snow", "rainy_snow"],
};

// Buienradar's icon codes are a letter, doubled for the night variant ("a" sunny, "aa" clear night).
export function weatherIconName(buienradarCode: string): WeatherIconName {
    const code = buienradarCode.toLowerCase();
    const isNight = code.length === 2 && code[0] === code[1];
    const icons = BY_BUIENRADAR_CODE[code[0]];
    if (!icons || (code.length > 1 && !isNight)) {
        return "cloud";
    }
    return isNight ? icons[1] : icons[0];
}
