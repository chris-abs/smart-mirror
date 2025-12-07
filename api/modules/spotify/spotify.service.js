export async function getCurrentlyPlaying() {
  return {
    trackName: "Dummy Track",
    artistName: "Dummy Artist",
    albumName: "Dummy Album",
    albumArtUrl: null,
    progressMs: 42_000,
    durationMs: 180_000,
    isPlaying: true,
    deviceName: "Jarvis Mirror",
  };
}

export async function play() {
  return { ok: true };
}

export async function pause() {
  return { ok: true };
}

export async function nextTrack() {
  return { ok: true };
}

export async function previousTrack() {
  return { ok: true };
}

export async function setVolume(volumePercent) {
  if (volumePercent < 0 || volumePercent > 100) {
    throw new Error("Volume must be between 0 and 100");
  }
  return { ok: true, volume: volumePercent };
}
