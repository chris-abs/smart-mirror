import { getIO } from "../websocket/index.js";
import { getCurrentlyPlaying } from "../modules/spotify/spotify.service.js";

let pollingTimeout = null;
let lastData = null;
let isPolling = false;

const POLL_INTERVAL_PLAYING = 2000;
const POLL_INTERVAL_IDLE = 10000; 

async function pollAndBroadcast() {
  if (!isPolling) {
    return;
  }

  try {
    const io = getIO();
    const spotifyRoom = io.sockets.adapter.rooms.get("spotify");
    
    if (!spotifyRoom || spotifyRoom.size === 0) {
      pollingTimeout = setTimeout(pollAndBroadcast, POLL_INTERVAL_IDLE);
      return;
    }

    const data = await getCurrentlyPlaying();
    
    io.to("spotify").emit("spotify:update", data);
    lastData = data;

    const interval = data?.isPlaying ? POLL_INTERVAL_PLAYING : POLL_INTERVAL_IDLE;
    pollingTimeout = setTimeout(pollAndBroadcast, interval);
  } catch (error) {
    if (error.message?.includes("not linked") || error.message?.includes("not configured")) {
      pollingTimeout = setTimeout(pollAndBroadcast, POLL_INTERVAL_IDLE * 2);
      return;
    }
    
    console.error("[Spotify Polling] Error:", error.message);
    
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
  
  setTimeout(() => {
    pollAndBroadcast();
  }, 1000);
}

export function stopSpotifyPolling() {
  isPolling = false;
  if (pollingTimeout) {
    clearTimeout(pollingTimeout);
    pollingTimeout = null;
    console.log("[Spotify Polling] Stopped polling service");
  }
}
