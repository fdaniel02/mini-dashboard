import { weatherIconName } from "@/lib/weatherIcon";
import { WEATHER_ICON_PATHS } from "@/lib/weatherIconPaths";

export default function WeatherIcon({
    code,
    label,
    className,
}: Readonly<{ code: string; label: string; className?: string }>) {
    return (
        <svg viewBox="0 -960 960 960" fill="currentColor" role="img" aria-label={label} className={className}>
            <title>{label}</title>
            <path d={WEATHER_ICON_PATHS[weatherIconName(code)]} />
        </svg>
    );
}
