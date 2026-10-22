import { useSyncExternalStore } from "react";

const STORAGE_KEY = "mini-dashboard.gong-muted";
const listeners = new Set<() => void>();
// Used when localStorage is unavailable (e.g. blocked), so muting still works until the next reload.
let mutedInMemory = false;

function readMuted(): boolean {
    try {
        return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
        return mutedInMemory;
    }
}

export function setGongMuted(muted: boolean) {
    mutedInMemory = muted;
    try {
        localStorage.setItem(STORAGE_KEY, String(muted));
    } catch {
        // Keeps the in-memory value.
    }
    listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    window.addEventListener("storage", listener);
    return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", listener);
    };
}

export function useGongMuted(): boolean {
    return useSyncExternalStore(subscribe, readMuted, () => false);
}
