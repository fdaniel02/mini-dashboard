import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import Dashboard from "./Dashboard";

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-22T10:00:00Z"));
    vi.stubGlobal(
        "fetch",
        vi.fn(() => new Promise(() => {})),
    );
});

afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
});

test("shows the date bar and all clocks", () => {
    render(<Dashboard />);

    expect(screen.getByText("2026-10-22, Thursday")).toBeDefined();
    expect(screen.getByText("W43")).toBeDefined();
    expect(screen.getByText("12:00:00")).toBeDefined();

    expect(screen.getByText("15:30")).toBeDefined();
    expect(screen.getByText("IST")).toBeDefined();
    expect(screen.getByText("(+05:30)")).toBeDefined();

    expect(screen.getByText("06:00")).toBeDefined();
    expect(screen.getByText("EDT")).toBeDefined();
    expect(screen.getByText("(-04:00)")).toBeDefined();

    expect(screen.getByText("10:00")).toBeDefined();
    expect(screen.getByText("UTC")).toBeDefined();
    expect(screen.getByText("(+00:00)")).toBeDefined();

    expect(screen.getByAltText("cat")).toBeDefined();
    expect(screen.getByText("S-2621")).toBeDefined();
    expect(screen.getByText("First week")).toBeDefined();
});

test("ticks every second", () => {
    render(<Dashboard />);

    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText("12:00:01")).toBeDefined();

    act(() => vi.advanceTimersByTime(59_000));
    expect(screen.getByText("12:01:00")).toBeDefined();
    expect(screen.getByText("15:31")).toBeDefined();
});

test("rolls the date over at midnight in Amsterdam", () => {
    vi.setSystemTime(new Date("2026-10-22T21:59:59Z"));
    render(<Dashboard />);
    expect(screen.getByText("2026-10-22, Thursday")).toBeDefined();

    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText("2026-10-23, Friday")).toBeDefined();
    expect(screen.getByText("00:00:00")).toBeDefined();
});

test("stops its timers when unmounted", () => {
    const { unmount } = render(<Dashboard />);
    expect(vi.getTimerCount()).toBeGreaterThan(0);

    unmount();
    expect(vi.getTimerCount()).toBe(0);
});

test("plays the gong at :55 and keeps rendering", () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, "play");
    vi.setSystemTime(new Date("2026-10-22T07:55:00Z"));

    render(<Dashboard />);

    expect(screen.getByText("09:55:00")).toBeDefined();
    expect(play).toHaveBeenCalledTimes(1);
});
