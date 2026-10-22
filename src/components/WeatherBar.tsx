import Image from "next/image";
import { useNow } from "@/lib/useNow";
import { useWeather } from "@/lib/useWeather";
import { ThermometerIcon, WindIcon } from "./icons";

export const WEATHER_STALE_AFTER_MS = 30 * 60_000;

export default function WeatherBar() {
    const { weather, fetchedAt } = useWeather();
    const now = useNow();

    if (!weather || fetchedAt === null) {
        return <div className="-mx-4 h-11 bg-black" />;
    }

    const stale = now !== null && now.getTime() - fetchedAt > WEATHER_STALE_AFTER_MS;

    return (
        <div className={`-mx-4 flex h-11 items-center bg-black ${stale ? "opacity-40" : ""}`}>
            <Image src={weather.iconUrl} alt={weather.condition} title={weather.condition} width={44} height={44} />
            <ThermometerIcon className="mr-1 size-6" />
            <p className="mr-5 text-2xl">{weather.temperatureC} °C</p>
            <WindIcon className="mr-1 size-6" />
            <p className="text-2xl">{weather.windKph} km/h</p>
        </div>
    );
}
