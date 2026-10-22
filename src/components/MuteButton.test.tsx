import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { setGongMuted } from "@/lib/useGongMuted";
import MuteButton from "./MuteButton";

const play = vi.fn<() => Promise<void>>();

beforeEach(() => {
    play.mockResolvedValue();
    vi.stubGlobal(
        "Audio",
        class {
            play = play;
        },
    );
});

afterEach(() => {
    act(() => setGongMuted(false));
    localStorage.clear();
    vi.unstubAllGlobals();
    play.mockReset();
});

const button = () => screen.getByRole("button", { name: "Mute the gong" });

test("starts unmuted, dimmed", () => {
    render(<MuteButton />);

    expect(button().getAttribute("aria-pressed")).toBe("false");
    expect(button().className).toContain("opacity-50");
});

test("a tap mutes the gong silently and shows it at full brightness", () => {
    render(<MuteButton />);

    fireEvent.click(button());

    expect(button().getAttribute("aria-pressed")).toBe("true");
    expect(button().className).not.toContain("opacity-50");
    expect(localStorage.getItem("mini-dashboard.gong-muted")).toBe("true");
    expect(play).not.toHaveBeenCalled();
});

test("a tap while muted unmutes it and plays the gong", () => {
    act(() => setGongMuted(true));
    render(<MuteButton />);

    fireEvent.click(button());

    expect(button().getAttribute("aria-pressed")).toBe("false");
    expect(localStorage.getItem("mini-dashboard.gong-muted")).toBe("false");
    expect(play).toHaveBeenCalledTimes(1);
});

test("shows a muted state stored before a reload", () => {
    localStorage.setItem("mini-dashboard.gong-muted", "true");

    render(<MuteButton />);

    expect(button().getAttribute("aria-pressed")).toBe("true");
});
