import { expect, test } from "vitest";
import { weatherIconName } from "./weatherIcon";

test.each([
    ["a", "sunny"],
    ["aa", "clear_night"],
    ["b", "partly_cloudy_day"],
    ["jj", "partly_cloudy_night"],
    ["r", "partly_cloudy_day"],
    ["c", "cloud"],
    ["cc", "cloud"],
    ["d", "foggy"],
    ["o", "foggy"],
    ["n", "mist"],
    ["e", "rainy_light"],
    ["f", "rainy_light"],
    ["k", "rainy_light"],
    ["mm", "rainy_light"],
    ["h", "rainy"],
    ["q", "rainy_heavy"],
    ["g", "thunderstorm"],
    ["ss", "thunderstorm"],
    ["x", "thunderstorm"],
    ["i", "sunny_snowing"],
    ["uu", "cloudy_snowing"],
    ["v", "cloudy_snowing"],
    ["t", "weather_snowy"],
    ["w", "rainy_snow"],
])("Buienradar code %s is %s", (code, icon) => {
    expect(weatherIconName(code)).toBe(icon);
});

test("ignores the case of the code", () => {
    expect(weatherIconName("A")).toBe("sunny");
    expect(weatherIconName("AA")).toBe("clear_night");
});

test.each(["", "z", "l", "ab", "aaa"])("falls back to a cloud for the unknown code %o", (code) => {
    expect(weatherIconName(code)).toBe("cloud");
});
