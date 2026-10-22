import { useEffect, useRef } from "react";
import { gongSlot } from "@/lib/gong";

export default function Gong({ now, timeZone }: { now: Date; timeZone: string }) {
    const slot = gongSlot(now, timeZone);
    // Tracks what has played, not just the effect's dependency, because StrictMode runs effects twice in development.
    const playedSlot = useRef<string | null>(null);
    const audio = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (!slot || slot === playedSlot.current) {
            return;
        }
        playedSlot.current = slot;
        audio.current ??= new Audio("/gong-bell.mp3");
        audio.current.play().catch((error: unknown) => console.warn("The gong could not play", error));
    }, [slot]);

    return null;
}
