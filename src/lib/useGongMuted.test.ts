import { afterEach, expect, test, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { setGongMuted, useGongMuted } from "./useGongMuted";

afterEach(() => {
    act(() => setGongMuted(false));
    localStorage.clear();
    vi.restoreAllMocks();
});

test("is not muted by default", () => {
    const { result } = renderHook(() => useGongMuted());

    expect(result.current).toBe(false);
});

test("mutes and unmutes, and stores it in localStorage", () => {
    const { result } = renderHook(() => useGongMuted());

    act(() => setGongMuted(true));
    expect(result.current).toBe(true);
    expect(localStorage.getItem("mini-dashboard.gong-muted")).toBe("true");

    act(() => setGongMuted(false));
    expect(result.current).toBe(false);
    expect(localStorage.getItem("mini-dashboard.gong-muted")).toBe("false");
});

test("keeps the state after a reload", () => {
    act(() => setGongMuted(true));
    const first = renderHook(() => useGongMuted());
    first.unmount();

    const afterReload = renderHook(() => useGongMuted());

    expect(afterReload.result.current).toBe(true);
});

test("picks up a change made in another tab", () => {
    const { result } = renderHook(() => useGongMuted());

    act(() => {
        localStorage.setItem("mini-dashboard.gong-muted", "true");
        window.dispatchEvent(new StorageEvent("storage", { key: "mini-dashboard.gong-muted" }));
    });

    expect(result.current).toBe(true);
});

test("still mutes when localStorage is unavailable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new DOMException("The operation is insecure.", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new DOMException("The operation is insecure.", "SecurityError");
    });
    const { result } = renderHook(() => useGongMuted());
    expect(result.current).toBe(false);

    act(() => setGongMuted(true));

    expect(result.current).toBe(true);
});
