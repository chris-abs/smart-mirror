import { IconButton } from "../../../../components/atoms/icon-button";
import {
  spotifyNext,
  spotifyPause,
  spotifyPlay,
  spotifyPrevious,
  useSpotifyNowPlaying,
} from "../../queries";

export function SpotifyNowPlayingCard() {
  const { data, isLoading, error } = useSpotifyNowPlaying(5000);

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

  return (
    <div className="rounded-xl border border-white/10 p-4 flex gap-4 bg-white/5">
      {track.albumArtUrl ? (
        <img
          src={track.albumArtUrl}
          alt={track.albumName ?? "Album art"}
          className="w-20 h-20 rounded-md object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-20 h-20 rounded-md bg-white/10 flex items-center justify-center text-xs opacity-60 flex-shrink-0">
          No art
        </div>
      )}

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] opacity-60 mb-1">
            Now Playing
          </div>
          <div className="text-lg font-semibold leading-snug">
            {track.trackName}
          </div>
          <div className="text-sm opacity-80">
            {track.artistName}
            {track.albumName ? ` • ${track.albumName}` : ""}
          </div>
          {track.deviceName && (
            <div className="text-[11px] opacity-60 mt-1">
              On {track.deviceName}
            </div>
          )}
        </div>

        <div className="mt-2">
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-white/80" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <IconButton onClick={handlePrevious}>⏮</IconButton>
          <IconButton onClick={handleTogglePlay}>
            {track.isPlaying ? "⏸" : "▶️"}
          </IconButton>
          <IconButton onClick={handleNext}>⏭</IconButton>
        </div>
      </div>
    </div>
  );
}
