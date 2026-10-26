import { piSprint } from "@/lib/pi";
import { sprintId, sprintWeek } from "@/lib/sprint";

function PiSection({ now, timeZone }: Readonly<{ now: Date; timeZone: string }>) {
    const current = piSprint(now, timeZone);
    if (!current) {
        return <p className="text-2xl">Please update the PI calendar!</p>;
    }

    const { pi, sprint, workingDaysLeft } = current;
    return (
        <>
            <p className="text-4xl">{`PI${pi}.${sprint}`}</p>
            <p className="text-2xl">{workingDaysLeft === 1 ? "last day" : `${workingDaysLeft} days left`}</p>
        </>
    );
}

export default function SprintPanel({ now, timeZone }: Readonly<{ now: Date; timeZone: string }>) {
    return (
        <div className="flex flex-col items-end text-right">
            <p className="text-3xl">{sprintId(now, timeZone)}</p>
            <p className="text-2xl">{sprintWeek(now, timeZone)}</p>
            <div className="mt-4 flex flex-col items-end">
                <PiSection now={now} timeZone={timeZone} />
            </div>
        </div>
    );
}
