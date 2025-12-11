import { useEffect, useRef, useState } from "react";
import { IconButton } from "../../../../components/atoms/icon-button";
import { Slider } from "../../../../components/atoms/slider";
import {
  spotifyNext,
  spotifyPause,
  spotifyPlay,
  spotifyPrevious,
  spotifySetVolume,
  useSpotifyNowPlaying,
} from "../../queries";

export function SpotifyNowPlayingCard() {
  const [volume, setVolume] = useState(50);
  const volumeUpdateTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const { data, isLoading, error } = useSpotifyNowPlaying(5000);
  const deviceVolume = data?.volumePercent;

  useEffect(() => {
    if (typeof deviceVolume === "number") {
      setVolume(deviceVolume);
    }
  }, [deviceVolume]);

  useEffect(() => {
    return () => {
      if (volumeUpdateTimeout.current) {
        clearTimeout(volumeUpdateTimeout.current);
      }
    };
  }, []);

  if (isLoading && !data) {
    return (
      <div className="rounded-xl border border-white/10 p-4">
        <div className="text-xs uppercase tracking-[0.2em] opacity-60 mb-2">
          Spotify
        </div>
        <div className="text-sm opacity-60">Loading current track…</div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-xl border border-red-500/40 p-4">
        <div className="text-xs uppercase tracking-[0.2em] opacity-60 mb-2">
          Spotify
        </div>
        <div className="text-sm text-red-300">
          Error: {(error as Error).message}
        </div>
      </div>
    );
  }

  const track = data;

  if (!track || !track.trackName) {
    return (
      <div className="rounded-xl border border-white/10 p-4">
        <div className="text-xs uppercase tracking-[0.2em] opacity-60 mb-2">
          Spotify
        </div>
        <div className="text-sm opacity-60">
          Nothing playing. Start playback on any device.
        </div>
      </div>
    );
  }

  const pct =
    track.durationMs > 0
      ? Math.min(100, (track.progressMs / track.durationMs) * 100)
      : 0;

  async function handleTogglePlay() {
    try {
      if (track?.isPlaying) {
        await spotifyPause();
      } else {
        await spotifyPlay();
      }
    } catch (e) {
      console.error("Spotify play/pause failed", e);
    }
  }

  async function handleNext() {
    try {
      await spotifyNext();
    } catch (e) {
      console.error("Spotify next failed", e);
    }
  }

  async function handlePrevious() {
    try {
      await spotifyPrevious();
    } catch (e) {
      console.error("Spotify previous failed", e);
    }
  }

  function scheduleVolumeUpdate(next: number) {
    setVolume(next);

    if (volumeUpdateTimeout.current) {
      clearTimeout(volumeUpdateTimeout.current);
    }

    volumeUpdateTimeout.current = setTimeout(async () => {
      try {
        await spotifySetVolume(next);
      } catch (e) {
        console.error("Spotify volume change failed", e);
      } finally {
        volumeUpdateTimeout.current = null;
      }
    }, 200);
  }

  return (
    <div className="rounded-xl border border-white/10 p-4 bg-white/5">
      <div className="text-xs uppercase tracking-[0.2em] opacity-60 mb-3">
        Spotify
      </div>
      <div className="grid grid-cols-2 gap-4 items-center">
        <div className="w-full max-w-[160px] aspect-square rounded-xl bg-white/5 flex items-center justify-center overflow-hidden mx-auto">
          {track.albumArtUrl ? (
            <img
              src={track.albumArtUrl}
              alt={track.albumName ?? "Album art"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-xs opacity-60">No art</div>
          )}
        </div>

        <div className="flex flex-col h-full gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] opacity-60 mb-1">
              Now Playing
            </div>
            <div className="text-xl font-semibold leading-tight">
              {track.trackName}
            </div>
            <div className="text-sm opacity-80 truncate">
              {track.artistName}
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
              onChange={(event) =>
                scheduleVolumeUpdate(Number(event.target.value))
              }
              aria-label="Volume"
            />
            <div className="text-[11px] opacity-60 text-right mt-1">
              {volume}%
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between gap-2">
            {track.deviceName && (
              <div className="text-[11px] opacity-60 truncate">
                On {track.deviceName}
              </div>
            )}
            <div className="flex gap-2">
              <IconButton onClick={handlePrevious}>⏮</IconButton>
              <IconButton onClick={handleTogglePlay}>
                {track.isPlaying ? "⏸" : "▶️"}
              </IconButton>
              <IconButton onClick={handleNext}>⏭</IconButton>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-white/80" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}
