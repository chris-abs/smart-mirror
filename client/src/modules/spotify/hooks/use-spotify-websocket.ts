import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { getSocket } from "../../../lib/websocket";
import { spotifyNowPlayingKey } from "../queries";
import type { NowPlaying } from "../../../lib/types/spotify";

export function useSpotifyWebSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();

    socket.emit("subscribe:spotify");

    const handleUpdate = (data: NowPlaying) => {
      queryClient.setQueryData(spotifyNowPlayingKey, data);
    };

    socket.on("spotify:update", handleUpdate);

    return () => {
      socket.off("spotify:update", handleUpdate);
      socket.emit("unsubscribe:spotify");
    };
  }, [queryClient]);
}
