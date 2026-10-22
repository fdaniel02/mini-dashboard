import { useEffect, useRef } from "react";
import { gongSlot } from "@/lib/gong";
import { playGong } from "@/lib/gongSound";
import { useGongMuted } from "@/lib/useGongMuted";

export default function Gong({ now, timeZone }: Readonly<{ now: Date; timeZone: string }>) {
    const slot = gongSlot(now, timeZone);
    const muted = useGongMuted();
    // Tracks what has played, not just the effect's dependency, because StrictMode runs effects twice in development.
    // A muted slot counts as handled too, so unmuting during :55 doesn't sound it late.
    const playedSlot = useRef<string | null>(null);

    useEffect(() => {
        if (!slot || slot === playedSlot.current) {
            return;
        }
        playedSlot.current = slot;
        if (!muted) {
            playGong();
        }
    }, [slot, muted]);

    return null;
}
