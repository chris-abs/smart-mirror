import { getIO } from "../websocket/index.js";
import { getCurrentlyPlaying } from "../modules/spotify/spotify.service.js";

let pollingTimeout = null;
let lastData = null;
let isPolling = false;

const POLL_INTERVAL_PLAYING = 2000; // 2 seconds when playing
const POLL_INTERVAL_IDLE = 10000; // 10 seconds when not playing

async function pollAndBroadcast() {
  if (!isPolling) {
    return;
  }

  try {
    const io = getIO();
    const spotifyRoom = io.sockets.adapter.rooms.get("spotify");
    
    // Only poll if there are subscribers
    if (!spotifyRoom || spotifyRoom.size === 0) {
      // No subscribers, check again later
      pollingTimeout = setTimeout(pollAndBroadcast, POLL_INTERVAL_IDLE);
      return;
    }

    const data = await getCurrentlyPlaying();
    
    // Always broadcast to keep clients in sync, even if data hasn't changed
    // (progress updates frequently)
    io.to("spotify").emit("spotify:update", data);
    lastData = data;

    // Adjust polling interval based on playback state
    const interval = data?.isPlaying ? POLL_INTERVAL_PLAYING : POLL_INTERVAL_IDLE;
    pollingTimeout = setTimeout(pollAndBroadcast, interval);
  } catch (error) {
    console.error("[Spotify Polling] Error:", error.message);
    
    // Continue polling even on error, but with longer interval
    pollingTimeout = setTimeout(pollAndBroadcast, POLL_INTERVAL_IDLE);
  }
}

export function startSpotifyPolling() {
  if (isPolling) {
    console.log("[Spotify Polling] Already running");
    return;
  }

  console.log("[Spotify Polling] Starting polling service");
  isPolling = true;
  
  // Start polling immediately
  pollAndBroadcast();
}

export function stopSpotifyPolling() {
  isPolling = false;
  if (pollingTimeout) {
    clearTimeout(pollingTimeout);
    pollingTimeout = null;
    console.log("[Spotify Polling] Stopped polling service");
  }
}
