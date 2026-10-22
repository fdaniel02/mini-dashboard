import { useEffect, useState } from "react";
import type { Weather } from "./weather";

export const WEATHER_REFRESH_MS = 5 * 60_000;

interface WeatherState {
    weather: Weather | null;
    fetchedAt: number | null;
}

export function useWeather(): WeatherState {
    const [state, setState] = useState<WeatherState>({ weather: null, fetchedAt: null });

    useEffect(() => {
        let unmounted = false;

        async function load() {
            try {
                const response = await fetch("/api/weather");
                if (!response.ok) {
                    return;
                }
                const weather = (await response.json()) as Weather;
                if (!unmounted) {
                    setState({ weather, fetchedAt: Date.now() });
                }
            } catch {
                // Keep the last reading; the bar dims itself once it gets too old.
            }
        }

        load();
        const interval = setInterval(load, WEATHER_REFRESH_MS);
        return () => {
            unmounted = true;
            clearInterval(interval);
        };
    }, []);

    return state;
}
