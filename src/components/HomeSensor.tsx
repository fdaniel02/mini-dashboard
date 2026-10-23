import type { HomeSensorName } from "@/config";
import { formatOneDecimal } from "@/lib/format";
import type { HomeReading } from "@/lib/homeAssistant";
import { useNow } from "@/lib/useNow";
import { dimmedWhenStale, usePolled } from "@/lib/usePolled";
import { HomeIcon, HumidityIcon } from "./icons";

// Sized by the text size in className: the icons and spacing are in em, so the same reading fits the weather bar and,
// much larger, the clock page.
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
            <HomeIcon className="mr-[0.17em] size-[1em]" />
            <p className="mr-[0.83em]">{formatOneDecimal(reading.data.temperatureC)} °C</p>
            <HumidityIcon className="mr-[0.17em] size-[1em]" />
            <p>{formatOneDecimal(reading.data.humidityPercent)} %</p>
        </div>
    );
}
