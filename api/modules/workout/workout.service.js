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
  workouts: [],
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
    ...data,
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

export async function getWorkoutCounts() {
  const data = await readWorkoutData();
  const workouts = data.workouts || [];

  const now = new Date();

  const dailyStart = new Date(now);
  dailyStart.setHours(0, 1, 0, 0);
  if (now < dailyStart) {
    dailyStart.setDate(dailyStart.getDate() - 1);
  }

  const startOfWeek = new Date(now);
  const dayOfWeek = startOfWeek.getDay(); // 0 = Sunday, 1 = Monday
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startOfWeek.setDate(startOfWeek.getDate() - daysFromMonday);
  startOfWeek.setHours(0, 1, 0, 0);
  if (now < startOfWeek) {
    startOfWeek.setDate(startOfWeek.getDate() - 7);
  }

  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
    0,
    1,
    0,
    0
  );
  if (now < startOfMonth) {
    startOfMonth.setMonth(startOfMonth.getMonth() - 1);
  }

  const workoutTimestamps = workouts.map((timestamp) => new Date(timestamp));

  const daily = workoutTimestamps.filter(
    (d) => d.getTime() >= dailyStart.getTime()
  ).length;
  const weekly = workoutTimestamps.filter(
    (d) => d.getTime() >= startOfWeek.getTime()
  ).length;
  const monthly = workoutTimestamps.filter(
    (d) => d.getTime() >= startOfMonth.getTime()
  ).length;

  const lastWorkoutDate =
    workouts.length > 0
      ? new Date(workouts[workouts.length - 1]).toISOString().split("T")[0]
      : null;

  return {
    daily,
    weekly,
    monthly,
    lastWorkoutDate,
  };
}

export async function recordActualWorkout() {
  const data = await readWorkoutData();
  const now = new Date();
  const timestamp = now.toISOString();

  const workouts = data.workouts || [];

  workouts.push(timestamp);
  workouts.sort();

  const updatedData = {
    ...data,
    workouts,
  };

  await writeWorkoutData(updatedData);
  return getWorkoutCounts();
}
