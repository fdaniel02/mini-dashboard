import { useNow } from "@/lib/useNow";
import { dimmedWhenStale, usePolled } from "@/lib/usePolled";
import type { Weather } from "@/lib/weather";
import HomeSensor from "./HomeSensor";
import { ThermometerIcon, WindIcon } from "./icons";
import MuteButton from "./MuteButton";
import WeatherIcon from "./WeatherIcon";

export default function WeatherBar() {
    const weather = usePolled<Weather>("/api/weather");
    const now = useNow();

    return (
        <div className="relative -mx-4 flex h-11 items-center bg-black">
            {weather.data && (
                <div className={`flex items-center ${dimmedWhenStale(now, weather.fetchedAt)}`}>
                    <WeatherIcon
                        code={weather.data.iconCode}
                        label={weather.data.condition}
                        className="mr-2 ml-1 size-9"
                    />
                    <ThermometerIcon className="mr-1 size-6" />
                    <p className="mr-5 text-2xl">{weather.data.temperatureC} °C</p>
                    <WindIcon className="mr-1 size-6" />
                    <p className="text-2xl">{weather.data.windKph} km/h</p>
                </div>
            )}
            <HomeSensor sensor="indoor" className="ml-8" />
            <MuteButton />
            <a
                href="https://www.buienradar.nl"
                className="absolute right-4 bottom-full z-10 mb-1 w-[165px] text-center text-xs opacity-50"
            >
                Buienradar.nl
            </a>
        </div>
    );
}
