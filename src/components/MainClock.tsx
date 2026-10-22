import { formatTime } from "@/lib/time";

export default function MainClock({ now, timeZone, className }: { now: Date; timeZone: string; className?: string }) {
    return <p className={className}>{formatTime(now, timeZone, { seconds: true })}</p>;
}
