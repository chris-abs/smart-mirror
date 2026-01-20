import { useQuery } from "@tanstack/react-query";

import { apiGet, apiPost } from "../../../lib/api";
import type { NowPlaying } from "../../../lib/types/spotify";
import { useSpotifyWebSocket } from "../hooks/use-spotify-websocket";

export const spotifyNowPlayingKey = ["spotify", "now-playing"] as const;

export function useSpotifyNowPlaying() {
  useSpotifyWebSocket();

  const query = useQuery<NowPlaying>({
    queryKey: spotifyNowPlayingKey,
    queryFn: () => apiGet<NowPlaying>("/api/spotify/now-playing"),
    refetchInterval: false, 
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  return query;
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
