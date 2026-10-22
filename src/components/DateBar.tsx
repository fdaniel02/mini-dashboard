import { formatDate, formatIsoWeek } from "@/lib/time";

export default function DateBar({
    now,
    timeZone,
    className = "text-[6vw]",
}: {
    now: Date;
    timeZone: string;
    className?: string;
}) {
    return (
        <div className={`flex justify-between ${className}`}>
            <p>{formatDate(now, timeZone)}</p>
            <p>{formatIsoWeek(now, timeZone)}</p>
        </div>
    );
}
