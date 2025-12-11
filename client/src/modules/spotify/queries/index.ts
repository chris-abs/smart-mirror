import { useQuery } from "@tanstack/react-query";
import { apiGet, apiPost } from "../../../lib/api";
import type { NowPlaying } from "../../../lib/types/spotify";

export const spotifyNowPlayingKey = ["spotify", "now-playing"] as const;

export function useSpotifyNowPlaying(pollIntervalMs = 5000) {
  return useQuery<NowPlaying>({
    queryKey: spotifyNowPlayingKey,
    queryFn: () => apiGet<NowPlaying>("/api/spotify/now-playing"),
    refetchInterval: pollIntervalMs,
    refetchOnWindowFocus: false,
    staleTime: pollIntervalMs,
  });
}

export function spotifyPlay() {
  return apiPost<{ ok: boolean }>("/api/spotify/play");
}

export function spotifyPause() {
  return apiPost<{ ok: boolean }>("/api/spotify/pause");
}

export function spotifyNext() {
  return apiPost<{ ok: boolean }>("/api/spotify/next");
}

export function spotifyPrevious() {
  return apiPost<{ ok: boolean }>("/api/spotify/previous");
}

export function spotifySetVolume(volume: number) {
  return apiPost<{ ok: boolean; volume: number }>("/api/spotify/volume", {
    volume,
  });
}
