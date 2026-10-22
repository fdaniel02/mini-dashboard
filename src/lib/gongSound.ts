export function playGong() {
    new Audio("/gong-bell.mp3").play().catch((error: unknown) => console.warn("The gong could not play", error));
}
