import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import SprintPanel from "./SprintPanel";

const AMSTERDAM = "Europe/Amsterdam";

test("shows the PI sprint with the working days left", () => {
    render(<SprintPanel now={new Date("2026-10-26T10:00:00Z")} timeZone={AMSTERDAM} />);

    expect(screen.getByText("PI14.5")).toBeDefined();
    expect(screen.getByText("7 days left")).toBeDefined();
    expect(screen.getByText("S-2621")).toBeDefined();
    expect(screen.getByText("Last week")).toBeDefined();
});

test("shows the last day of a sprint", () => {
    render(<SprintPanel now={new Date("2026-11-03T10:00:00Z")} timeZone={AMSTERDAM} />);

    expect(screen.getByText("PI14.5")).toBeDefined();
    expect(screen.getByText("last day")).toBeDefined();
});

test("asks for a calendar update after the last configured PI", () => {
    render(<SprintPanel now={new Date("2028-04-05T10:00:00Z")} timeZone={AMSTERDAM} />);

    expect(screen.getByText("Please update the PI calendar!")).toBeDefined();
    expect(screen.queryByText(/^PI\d/)).toBeNull();
});
