import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_FILE = join(__dirname, "workout-data.json");

const DEFAULT_DATA = {
  streak: 0,
  lastWorkoutDate: null,
};

async function readWorkoutData() {
  try {
    const data = await readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      return { ...DEFAULT_DATA };
    }
    throw error;
  }
}

async function writeWorkoutData(data) {
  await writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function getWorkoutStreak() {
  const data = await readWorkoutData();
  return {
    streak: data.streak || 0,
    lastWorkoutDate: data.lastWorkoutDate || null,
  };
}

export async function recordWorkout() {
  const data = await readWorkoutData();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let newStreak = 1;
  let lastWorkoutDate = today.toISOString().split("T")[0];

  if (data.lastWorkoutDate) {
    const lastDate = new Date(data.lastWorkoutDate);
    lastDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor(
      (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 0) {
      newStreak = data.streak || 0;
      lastWorkoutDate = data.lastWorkoutDate;
    } else if (daysDiff === 1) {
      newStreak = (data.streak || 0) + 1;
    } else {
      newStreak = 1;
    }
  }

  const updatedData = {
    streak: newStreak,
    lastWorkoutDate,
  };

  await writeWorkoutData(updatedData);
  return updatedData;
}

export async function resetWorkoutStreak() {
  const resetData = { ...DEFAULT_DATA };
  await writeWorkoutData(resetData);
  return resetData;
}

