"use client";

import { HOME_TIME_ZONE } from "@/config";
import { useNow } from "@/lib/useNow";
import DateBar from "./DateBar";
import MainClock from "./MainClock";

export default function ClockScreen() {
    const now = useNow();
    if (!now) {
        return null;
    }

    return (
        <div className="flex grow flex-col justify-center font-bold">
            <DateBar now={now} timeZone={HOME_TIME_ZONE} className="text-[50px]" />
            <div className="flex grow justify-center font-mono">
                <MainClock now={now} timeZone={HOME_TIME_ZONE} className="text-[20vw]" />
            </div>
        </div>
    );
}
