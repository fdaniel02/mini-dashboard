import { expect, test } from "vitest";
import { parseSensorState } from "./homeAssistant";

test.each([
    ["18.5", 18.5],
    ["58.1", 58.1],
    ["-3.2", -3.2],
    ["0", 0],
])("reads the state %o as %d", (state, value) => {
    expect(parseSensorState({ entity_id: "sensor.x", state, attributes: {} })).toBe(value);
});

test.each([
    ["unavailable", { state: "unavailable" }],
    ["unknown", { state: "unknown" }],
    ["an empty state", { state: "" }],
    ["a non-numeric state", { state: "on" }],
    ["a missing state", { entity_id: "sensor.x" }],
    ["a numeric state that isn't a string", { state: 18.5 }],
    ["no body", null],
])("has no value for %s", (_, body) => {
    expect(parseSensorState(body)).toBeNull();
});
