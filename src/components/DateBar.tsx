import { formatDate, formatIsoWeek } from "@/lib/time";

export default function DateBar({ now, timeZone }: { now: Date; timeZone: string }) {
    return (
        <div className="flex justify-between text-[6vw]">
            <p>{formatDate(now, timeZone)}</p>
            <p>{formatIsoWeek(now, timeZone)}</p>
        </div>
    );
}
