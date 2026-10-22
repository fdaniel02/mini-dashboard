// @vitest-environment node
import { expect, test } from "vitest";
import { GET } from "./route";

test("reports the app as live", async () => {
    const response = GET();

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("ok");
});
