import { useQuery } from "@tanstack/react-query";

import { apiGet, apiPost } from "../../../lib/api";
import type { NowPlaying } from "../../../lib/types/spotify";

export const spotifyNowPlayingKey = ["spotify", "now-playing"] as const;

export function useSpotifyNowPlaying() {
  return useQuery<NowPlaying>({
    queryKey: spotifyNowPlayingKey,
    queryFn: () => apiGet<NowPlaying>("/api/spotify/now-playing"),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.isPlaying) {
        return 2000;
      }
      return 10000;
    },
    refetchOnWindowFocus: false,
    staleTime: 1000,
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
