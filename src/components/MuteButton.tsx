import { playGong } from "@/lib/gongSound";
import { setGongMuted, useGongMuted } from "@/lib/useGongMuted";
import { VolumeOffIcon, VolumeUpIcon } from "./icons";

export default function MuteButton() {
    const muted = useGongMuted();

    function toggle() {
        setGongMuted(!muted);
        if (muted) {
            playGong();
        }
    }

    return (
        <button
            type="button"
            aria-label="Mute the gong"
            aria-pressed={muted}
            title={muted ? "Gong muted" : "Gong on"}
            onClick={toggle}
            className={`ml-auto flex h-11 w-14 cursor-pointer items-center justify-center ${muted ? "" : "opacity-50"}`}
        >
            {muted ? <VolumeOffIcon className="size-7" /> : <VolumeUpIcon className="size-7" />}
        </button>
    );
}
