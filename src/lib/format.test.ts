import { expect, test } from "vitest";
import { formatOneDecimal } from "./format";

test.each([
    [18, "18.0"],
    [18.5, "18.5"],
    [57.55, "57.5"],
    [18.25, "18.3"],
    [18.24, "18.2"],
    [0, "0.0"],
    [-3.2, "-3.2"],
    [-0.04, "0.0"],
    [100, "100.0"],
])("formats %d as %s", (value, text) => {
    expect(formatOneDecimal(value)).toBe(text);
});
