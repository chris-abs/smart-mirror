import { SkipBack, Play, SkipForward } from "lucide-react";
import { IconButton } from "../../../../components/atoms/icon-button";
import { Slider } from "../../../../components/atoms/slider";

type SpotifyInactiveStateProps = {
  volume: number;
};

export function SpotifyInactiveState({ volume }: SpotifyInactiveStateProps) {
  return (
    <div className="rounded-xl border border-white/10 p-4 bg-white/5 min-h-75">
      <div className="text-xs uppercase tracking-[0.2em] opacity-60 mb-3">
        Spotify
      </div>
      <div className="grid grid-cols-2 gap-4 items-center">
        <div className="w-full max-w-40 aspect-square rounded-xl bg-white/5 flex items-center justify-center overflow-hidden mx-auto">
          <div className="text-xs opacity-60">No art</div>
        </div>

        <div className="flex flex-col h-full gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] opacity-60 mb-1">
              Now Playing
            </div>
            <div className="text-xl font-semibold leading-tight opacity-60">
              No track playing
            </div>
            <div className="text-sm opacity-60 truncate">
              Start playback on any device
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.2em] opacity-60 mb-1">
              Volume
            </div>
            <Slider
              min={0}
              max={100}
              value={volume}
              aria-label="Volume"
              disabled
            />
            <div className="text-[11px] opacity-60 text-right mt-1">
              {volume}%
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between gap-2">
            <div className="text-[11px] opacity-60 truncate"></div>
            <div className="flex items-center gap-3">
              <IconButton
                disabled
                className="size-10 rounded-full border-white/30 bg-white/5 opacity-50"
                aria-label="Previous track"
              >
                <SkipBack className="size-4" />
              </IconButton>
              <IconButton
                disabled
                className="size-12 rounded-full border-white/40 bg-white/10 opacity-50"
                aria-label="Play"
              >
                <Play className="size-5 ml-0.5" />
              </IconButton>
              <IconButton
                disabled
                className="size-10 rounded-full border-white/30 bg-white/5 opacity-50"
                aria-label="Next track"
              >
                <SkipForward className="size-4" />
              </IconButton>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-white/80" style={{ width: "0%" }} />
        </div>
      </div>
    </div>
  );
}





