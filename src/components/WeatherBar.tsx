import Image from "next/image";
import { type PrecipitationForecast, precipitationLabel } from "@/lib/precipitation";
import { useNow } from "@/lib/useNow";
import { usePolled } from "@/lib/usePolled";
import type { Weather } from "@/lib/weather";
import { RainIcon, ThermometerIcon, WindIcon } from "./icons";

export const WEATHER_STALE_AFTER_MS = 30 * 60_000;

export default function WeatherBar() {
    const weather = usePolled<Weather>("/api/weather");
    const precipitation = usePolled<PrecipitationForecast>("/api/precipitation");
    const now = useNow();
    const rainLabel = precipitation.data && precipitationLabel(precipitation.data);

    const dimmedWhenStale = (fetchedAt: number | null) =>
        now !== null && fetchedAt !== null && now.getTime() - fetchedAt > WEATHER_STALE_AFTER_MS ? "opacity-40" : "";

    return (
        <div className="-mx-4 flex h-11 items-center bg-black">
            {weather.data && (
                <div className={`flex items-center ${dimmedWhenStale(weather.fetchedAt)}`}>
                    <Image
                        src={weather.data.iconUrl}
                        alt={weather.data.condition}
                        title={weather.data.condition}
                        width={44}
                        height={44}
                    />
                    <ThermometerIcon className="mr-1 size-6" />
                    <p className="mr-5 text-2xl">{weather.data.temperatureC} °C</p>
                    <WindIcon className="mr-1 size-6" />
                    <p className="text-2xl">{weather.data.windKph} km/h</p>
                </div>
            )}
            {rainLabel && (
                <div className={`ml-8 flex items-center ${dimmedWhenStale(precipitation.fetchedAt)}`}>
                    <RainIcon className="mr-1 size-7" />
                    <p className="text-2xl">{rainLabel}</p>
                </div>
            )}
            <a href="https://www.buienradar.nl" className="mt-1 ml-1.5 self-start text-xs opacity-50">
                Buienradar.nl
            </a>
        </div>
    );
}
