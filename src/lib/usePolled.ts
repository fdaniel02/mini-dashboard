import { useEffect, useState } from "react";

export const POLL_INTERVAL_MS = 5 * 60_000;
export const STALE_AFTER_MS = 30 * 60_000;

export function dimmedWhenStale(now: Date | null, fetchedAt: number | null): string {
    return now !== null && fetchedAt !== null && now.getTime() - fetchedAt > STALE_AFTER_MS ? "opacity-40" : "";
}

interface Polled<T> {
    data: T | null;
    fetchedAt: number | null;
}

export function usePolled<T>(url: string): Polled<T> {
    const [state, setState] = useState<Polled<T>>({ data: null, fetchedAt: null });

    useEffect(() => {
        let unmounted = false;

        async function load() {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    return;
                }
                const data = (await response.json()) as T;
                if (!unmounted) {
                    setState({ data, fetchedAt: Date.now() });
                }
            } catch {
                // Keep the last reading; the weather bar dims it once it gets too old.
            }
        }

        void load();
        const interval = setInterval(load, POLL_INTERVAL_MS);
        return () => {
            unmounted = true;
            clearInterval(interval);
        };
    }, [url]);

    return state;
}
