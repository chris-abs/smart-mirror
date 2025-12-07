import { Router } from "express";
import {
  getCurrentlyPlaying,
  play,
  pause,
  nextTrack,
  previousTrack,
  setVolume,
} from "./spotify.service.js";

const router = Router();

router.get("/now-playing", async (req, res) => {
  try {
    const data = await getCurrentlyPlaying();
    res.json(data);
  } catch (err) {
    console.error("[Spotify] now-playing error:", err);
    res.status(500).json({ error: "Failed to get currently playing track" });
  }
});

router.post("/play", async (_req, res) => {
  try {
    const result = await play();
    res.json(result);
  } catch (err) {
    console.error("[Spotify] play error:", err);
    res.status(500).json({ error: "Failed to start playback" });
  }
});

router.post("/pause", async (_req, res) => {
  try {
    const result = await pause();
    res.json(result);
  } catch (err) {
    console.error("[Spotify] pause error:", err);
    res.status(500).json({ error: "Failed to pause playback" });
  }
});

router.post("/next", async (_req, res) => {
  try {
    const result = await nextTrack();
    res.json(result);
  } catch (err) {
    console.error("[Spotify] next error:", err);
    res.status(500).json({ error: "Failed to skip to next track" });
  }
});

router.post("/previous", async (_req, res) => {
  try {
    const result = await previousTrack();
    res.json(result);
  } catch (err) {
    console.error("[Spotify] previous error:", err);
    res.status(500).json({ error: "Failed to skip to previous track" });
  }
});

router.post("/volume", async (req, res) => {
  try {
    const { volume } = req.body;
    if (typeof volume !== "number") {
      return res.status(400).json({ error: "volume (number) is required" });
    }

    const result = await setVolume(volume);
    res.json(result);
  } catch (err) {
    console.error("[Spotify] volume error:", err);
    res.status(400).json({ error: err.message || "Failed to set volume" });
  }
});

export default router;
