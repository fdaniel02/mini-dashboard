import type { ZoneClockConfig } from "@/config";
import { formatTime, utcOffset, zoneAbbreviation } from "@/lib/time";

export default function ZoneClock({ now, timeZone, abbreviationLocale }: { now: Date } & ZoneClockConfig) {
    return (
        <div className="flex">
            <p className="text-[6.5vw]">{formatTime(now, timeZone)}</p>
            <div className="pl-2 text-center text-xl">
                <p className="pt-2">{zoneAbbreviation(now, timeZone, abbreviationLocale)}</p>
                <p className="-mt-2">({utcOffset(now, timeZone)})</p>
            </div>
        </div>
    );
}
