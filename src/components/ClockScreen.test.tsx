import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import ClockScreen from "./ClockScreen";

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-22T10:00:00Z"));
});

afterEach(() => {
    vi.useRealTimers();
});

test("shows the date bar and the Amsterdam clock", () => {
    render(<ClockScreen />);

    expect(screen.getByText("2026-10-22, Thursday")).toBeDefined();
    expect(screen.getByText("W43")).toBeDefined();
    expect(screen.getByText("12:00:00")).toBeDefined();

    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText("12:00:01")).toBeDefined();
});
