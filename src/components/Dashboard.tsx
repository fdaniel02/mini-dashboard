"use client";

import { HOME_TIME_ZONE, SECONDARY_CLOCK_ROWS } from "@/config";
import { useNow } from "@/lib/useNow";
import DateBar from "./DateBar";
import MainClock from "./MainClock";
import ZoneClock from "./ZoneClock";

export default function Dashboard() {
    const now = useNow();
    if (!now) {
        return null;
    }

    return (
        <div className="flex h-screen grow flex-col justify-between font-bold">
            <DateBar now={now} timeZone={HOME_TIME_ZONE} />
            <div className="mb-auto flex justify-between">
                <div className="grow font-mono">
                    <div className="-mt-2 -mb-3">
                        <MainClock now={now} timeZone={HOME_TIME_ZONE} className="text-[15vw]" />
                    </div>
                    {SECONDARY_CLOCK_ROWS.map((row) => (
                        <div key={row.map((clock) => clock.timeZone).join()} className="flex justify-between">
                            {row.map((clock) => (
                                <ZoneClock key={clock.timeZone} now={now} {...clock} />
                            ))}
                        </div>
                    ))}
                </div>
                <div className="w-3/12" />
            </div>
        </div>
    );
}
