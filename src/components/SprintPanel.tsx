import { sprintId, sprintWeek } from "@/lib/sprint";

export default function SprintPanel({ now, timeZone }: Readonly<{ now: Date; timeZone: string }>) {
    return (
        <div className="flex flex-col items-end">
            <p className="text-3xl">{sprintId(now, timeZone)}</p>
            <p className="text-2xl">{sprintWeek(now, timeZone)}</p>
        </div>
    );
}
