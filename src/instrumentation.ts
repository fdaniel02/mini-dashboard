import { registerOTel } from "@vercel/otel";
import { traceSampler } from "@/lib/telemetry";

export function register() {
    registerOTel({ serviceName: "mini-dashboard", traceSampler });
}
