import { bulkImportWorkouts } from "../modules/workout/workout.service.js";
import { testConnection } from "../db/index.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Setup workout data based on patterns:
 * - Every Monday, Tuesday, Thursday from last week of May until yesterday = has_workout
 * - Every Friday since October 24th = has_workout
 * - Daily exercise streak from December 26th until yesterday = has_daily_exercise
 */
async function setupWorkoutData() {
  console.log("Setting up workout data...");

  const connected = await testConnection();
  if (!connected) {
    console.error(
      "Failed to connect to database. Please check your DATABASE_URL."
    );
    process.exit(1);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  // Start from last week of May 2025 (May 26, 2025 is the last Monday of May)
  const startDate = new Date("2025-05-26");
  startDate.setHours(0, 0, 0, 0);

  // October 24, 2025 for Friday workouts
  const fridayStartDate = new Date("2025-10-24");
  fridayStartDate.setHours(0, 0, 0, 0);

  // December 26, 2025 for daily exercise streak
  const dailyExerciseStartDate = new Date("2025-12-26");
  dailyExerciseStartDate.setHours(0, 0, 0, 0);

  const entries = [];
  const currentDate = new Date(startDate);

  while (currentDate <= today) {
    const dateStr = currentDate.toISOString().split("T")[0];
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, etc.

    let hasWorkout = false;
    let hasDailyExercise = false;

    // Check if date is Monday (1), Tuesday (2), or Thursday (4) from start date
    if (
      currentDate >= startDate &&
      (dayOfWeek === 1 || dayOfWeek === 2 || dayOfWeek === 4)
    ) {
      hasWorkout = true;
    }

    // Check if date is Friday (5) since October 24th
    if (currentDate >= fridayStartDate && dayOfWeek === 5) {
      hasWorkout = true;
    }

    // Check if date is in daily exercise streak (December 26th until yesterday)
    if (currentDate >= dailyExerciseStartDate && currentDate < today) {
      hasDailyExercise = true;
    }

    entries.push({
      date: dateStr,
      has_workout: hasWorkout,
      has_daily_exercise: hasDailyExercise,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  console.log(`Generated ${entries.length} entries`);
  console.log(`Workouts: ${entries.filter((e) => e.has_workout).length} days`);
  console.log(
    `Daily exercises: ${
      entries.filter((e) => e.has_daily_exercise).length
    } days`
  );

  try {
    // Import in batches
    const BATCH_SIZE = 100;
    let imported = 0;

    for (let i = 0; i < entries.length; i += BATCH_SIZE) {
      const batch = entries.slice(i, i + BATCH_SIZE);
      const result = await bulkImportWorkouts(batch);
      imported += result.imported;
      console.log(`Imported batch: ${imported}/${entries.length} entries`);
    }

    console.log(`✓ Successfully imported ${imported} entries`);
  } catch (error) {
    console.error("Error importing data:", error);
    process.exit(1);
  }

  console.log("Workout data setup complete!");
}

setupWorkoutData()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Setup failed:", error);
    process.exit(1);
  });
