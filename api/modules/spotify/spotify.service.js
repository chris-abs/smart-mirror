import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;
const SCOPES =
  process.env.SPOTIFY_SCOPES ||
  "user-read-playback-state user-modify-playback-state user-read-currently-playing";

if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
  console.warn(
    "[Spotify] Missing CLIENT_ID / CLIENT_SECRET / REDIRECT_URI in .env"
  );
}

const TOKENS_FILE = path.join(
  path.dirname(new URL(import.meta.url).pathname),
  "spotify-tokens.json"
);

let accessToken = null;
let accessTokenExpiresAt = 0;
let refreshToken = null;

async function loadTokensFromDisk() {
  try {
    const data = await fs.readFile(TOKENS_FILE, "utf8");
    const parsed = JSON.parse(data);
    refreshToken = parsed.refreshToken || null;
    accessToken = parsed.accessToken || null;
    accessTokenExpiresAt = parsed.accessTokenExpiresAt || 0;
    console.log("[Spotify] Loaded tokens from disk.");
  } catch {
    console.log("[Spotify] No tokens file yet, will create after first auth.");
  }
}

async function saveTokensToDisk() {
  const data = {
    refreshToken,
    accessToken,
    accessTokenExpiresAt,
  };
  await fs.writeFile(TOKENS_FILE, JSON.stringify(data, null, 2), "utf8");
}

loadTokensFromDisk();

function getBasicAuthHeader() {
  const raw = `${CLIENT_ID}:${CLIENT_SECRET}`;
  return Buffer.from(raw).toString("base64");
}

export function getLoginUrl() {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
  });
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function handleOAuthCallback(code) {
  const tokenUrl = "https://accounts.spotify.com/api/token";

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${getBasicAuthHeader()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[Spotify] Token exchange failed:", text);
    throw new Error("Failed to exchange authorization code for tokens.");
  }

  const data = await res.json();

  accessToken = data.access_token;
  const expiresIn = data.expires_in || 3600;
  accessTokenExpiresAt = Date.now() + expiresIn * 1000;
  refreshToken = data.refresh_token || refreshToken;

  await saveTokensToDisk();

  console.log("[Spotify] Successfully stored refresh token.");

  return { ok: true };
}

async function ensureAccessToken() {
  const now = Date.now();

  if (accessToken && now < accessTokenExpiresAt - 30_000) {
    return;
  }

  if (!refreshToken) {
    throw new Error("Spotify is not linked yet. Please connect first.");
  }

  const tokenUrl = "https://accounts.spotify.com/api/token";

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${getBasicAuthHeader()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[Spotify] Refresh token failed:", text);
    throw new Error("Failed to refresh Spotify token.");
  }

  const data = await res.json();

  accessToken = data.access_token;
  const expiresIn = data.expires_in || 3600;
  accessTokenExpiresAt = Date.now() + expiresIn * 1000;

  if (data.refresh_token) {
    refreshToken = data.refresh_token;
  }

  await saveTokensToDisk();
  console.log("[Spotify] Access token refreshed.");
}

async function spotifyFetch(path, options = {}) {
  await ensureAccessToken();

  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (res.status === 204) {
    return null;
  }

  if (!res.ok) {
    const text = await res.text();
    console.error("[Spotify] API error:", res.status, text);
    throw new Error(`Spotify API error ${res.status}`);
  }

  return res.json();
}

export async function getCurrentlyPlaying() {
  const data = await spotifyFetch("/me/player/currently-playing");

  if (!data || !data.item) {
    return {
      trackName: null,
      artistName: null,
      albumName: null,
      albumArtUrl: null,
      progressMs: 0,
      durationMs: 0,
      isPlaying: false,
      deviceName: null,
    };
  }

  return {
    trackName: data.item.name,
    artistName: data.item.artists?.map((a) => a.name).join(", ") || null,
    albumName: data.item.album?.name || null,
    albumArtUrl: data.item.album?.images?.[0]?.url || null,
    progressMs: data.progress_ms || 0,
    durationMs: data.item.duration_ms || 0,
    isPlaying: !!data.is_playing,
    deviceName: data.device?.name || null,
  };
}

export async function play() {
  await spotifyFetch("/me/player/play", { method: "PUT" });
  return { ok: true };
}

export async function pause() {
  await spotifyFetch("/me/player/pause", { method: "PUT" });
  return { ok: true };
}

export async function nextTrack() {
  await spotifyFetch("/me/player/next", { method: "POST" });
  return { ok: true };
}

export async function previousTrack() {
  await spotifyFetch("/me/player/previous", { method: "POST" });
  return { ok: true };
}

export async function setVolume(volumePercent) {
  if (volumePercent < 0 || volumePercent > 100) {
    throw new Error("Volume must be between 0 and 100");
  }

  await spotifyFetch(
    `/me/player/volume?volume_percent=${encodeURIComponent(volumePercent)}`,
    { method: "PUT" }
  );

  return { ok: true, volume: volumePercent };
}
