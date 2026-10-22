import { useSyncExternalStore } from "react";

let now = Date.now();
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | undefined;

function scheduleNextTick() {
    // Aligned to the start of the next second, so the clocks don't drift away from it over days of uptime.
    timer = setTimeout(tick, 1000 - (Date.now() % 1000));
}

function tick() {
    now = Date.now();
    listeners.forEach((listener) => listener());
    scheduleNextTick();
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    if (listeners.size === 1) {
        now = Date.now();
        scheduleNextTick();
    }
    return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
            clearTimeout(timer);
        }
    };
}

// null on the server, so time-dependent markup only renders in the browser and can't cause hydration mismatches.
export function useNow(): Date | null {
    const timestamp = useSyncExternalStore(
        subscribe,
        () => now,
        () => null,
    );
    return timestamp === null ? null : new Date(timestamp);
}
