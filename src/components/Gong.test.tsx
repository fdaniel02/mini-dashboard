import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { act, render } from "@testing-library/react";
import Gong from "./Gong";

const AMSTERDAM = "Europe/Amsterdam";
const play = vi.fn<() => Promise<void>>();
const created = vi.fn<(src: string) => void>();

beforeEach(() => {
    play.mockResolvedValue();
    vi.stubGlobal(
        "Audio",
        class {
            constructor(src: string) {
                created(src);
            }
            play = play;
        },
    );
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    play.mockReset();
    created.mockReset();
});

function renderAt(iso: string) {
    const result = render(<Gong now={new Date(iso)} timeZone={AMSTERDAM} />);
    return {
        at: (next: string) => result.rerender(<Gong now={new Date(next)} timeZone={AMSTERDAM} />),
    };
}

test("plays the gong once at :55", () => {
    const clock = renderAt("2026-10-22T07:54:59Z");
    expect(play).not.toHaveBeenCalled();

    clock.at("2026-10-22T07:55:00Z");
    clock.at("2026-10-22T07:55:01Z");
    clock.at("2026-10-22T07:55:59Z");
    clock.at("2026-10-22T07:56:00Z");

    expect(play).toHaveBeenCalledTimes(1);
    expect(created).toHaveBeenCalledWith("/gong-bell.mp3");
});

test("plays again the next hour, reusing the audio element", () => {
    const clock = renderAt("2026-10-22T07:55:00Z");
    clock.at("2026-10-22T08:55:00Z");

    expect(play).toHaveBeenCalledTimes(2);
    expect(created).toHaveBeenCalledTimes(1);
});

test("stays silent outside the gong hours", () => {
    const clock = renderAt("2026-10-22T06:55:00Z");
    clock.at("2026-10-22T21:55:00Z");

    expect(play).not.toHaveBeenCalled();
});

test("logs a warning when the browser blocks the sound", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    play.mockRejectedValue(new DOMException("play() failed", "NotAllowedError"));

    await act(async () => {
        renderAt("2026-10-22T07:55:00Z");
    });

    expect(warn).toHaveBeenCalledWith("The gong could not play", expect.any(DOMException));
});
