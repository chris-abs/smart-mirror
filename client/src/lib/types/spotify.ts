export type NowPlaying = {
  trackName: string | null;
  artistName: string | null;
  albumName: string | null;
  albumArtUrl: string | null;
  progressMs: number;
  durationMs: number;
  isPlaying: boolean;
  deviceName: string | null;
};
