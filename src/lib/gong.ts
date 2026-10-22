import { GONG } from "@/config";
import { zonedDateTime } from "./time";

export function gongSlot(now: Date, timeZone: string): string | null {
    const { year, month, day, hour, minute } = zonedDateTime(now, timeZone);
    if (minute !== GONG.minute || hour < GONG.firstHour || hour > GONG.lastHour) {
        return null;
    }
    return `${year}-${month}-${day}T${hour}`;
}
