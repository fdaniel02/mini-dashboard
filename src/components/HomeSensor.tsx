import type { HomeSensorName } from "@/config";
import type { HomeReading } from "@/lib/homeAssistant";
import { useNow } from "@/lib/useNow";
import { dimmedWhenStale, usePolled } from "@/lib/usePolled";
import { HomeIcon, HumidityIcon } from "./icons";

export default function HomeSensor({
    sensor,
    className = "",
}: Readonly<{ sensor: HomeSensorName; className?: string }>) {
    const reading = usePolled<HomeReading>(`/api/home-sensors/${sensor}`);
    const now = useNow();

    if (!reading.data) {
        return null;
    }

    return (
        <div
            className={`flex items-center ${className} ${dimmedWhenStale(now, reading.fetchedAt)}`}
            data-sensor={sensor}
        >
            <HomeIcon className="mr-1 size-6" />
            <p className="mr-5 text-2xl">{reading.data.temperatureC} °C</p>
            <HumidityIcon className="mr-1 size-6" />
            <p className="text-2xl">{reading.data.humidityPercent} %</p>
        </div>
    );
}
