import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// jsdom doesn't implement media playback: its play() returns undefined instead of a promise like browsers do.
if (typeof HTMLMediaElement !== "undefined") {
    HTMLMediaElement.prototype.play = () => Promise.resolve();
}

afterEach(cleanup);
