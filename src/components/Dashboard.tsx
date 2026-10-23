"use client";

import Image from "next/image";
import { HOME_TIME_ZONE, SECONDARY_CLOCK_ROWS } from "@/config";
import { useNow } from "@/lib/useNow";
import DateBar from "./DateBar";
import Gong from "./Gong";
import MainClock from "./MainClock";
import SprintPanel from "./SprintPanel";
import WeatherBar from "./WeatherBar";
import ZoneClock from "./ZoneClock";

export default function Dashboard() {
    const now = useNow();
    if (!now) {
        return null;
    }

    return (
        <div className="flex h-screen grow flex-col justify-between font-bold">
            <Gong now={now} timeZone={HOME_TIME_ZONE} />
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
                <div className="w-3/12">
                    <SprintPanel now={now} timeZone={HOME_TIME_ZONE} />
                </div>
            </div>
            <div className="flex justify-end">
                <Image src="/cat.png" alt="cat" width={165} height={116} className="-mt-28" />
            </div>
            <WeatherBar />
        </div>
    );
}
